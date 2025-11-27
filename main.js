d3.csv('travel_destinations.csv').then(
    res => {
        console.log(res); //印出輸入資料內容
        const heatmapData = getMonthlyRecommendations(res); //資料預處理
        drawHeatmap(heatmapData);
    }
);

const targetCountries = ['China', 'Japan', 'South Korea'];
const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let monthlyCounts = {}; // 儲存月份計數的物件

// 初始化月份計數物件
function initializeMonthlyCounts() {
    monthlyCounts = {}; // 重設 monthlyCounts
    targetCountries.forEach(country => {  //對每個目標國家建立空物件
        monthlyCounts[country] = {};
        allMonths.forEach(month => {  //對每個國家的月份初始化計數為0
            monthlyCounts[country][month] = 0;
        });
    });
}

//月份資料清理
function extractMonths(timeString) {
    
    // 移除括號內的內容、字串開頭和結尾的空白字元
    let cleanString = timeString.replace(/\([^)]*\)/g, '').trim();
    
    // 將空白和逗號作為分割依據
    let parts = cleanString.split(/[\s,]/);
    
    return parts
        .map(part => part.trim()) //去除前後空白
        .filter(part => allMonths.includes(part)); //只保留有效月份
}

// 資料清理主函式：載入資料並計算每月推薦次數
function getMonthlyRecommendations(res) {
    initializeMonthlyCounts();

    // 處理資料
    res.forEach(d => {
        const country = d.Country;
        const BestTime = d.Best_Time_to_Travel;

        // 檢查是否為目標國家且有推薦時間
        if (targetCountries.includes(country) && BestTime) {
            const recommendedMonths = extractMonths(BestTime);
            
            // 增加該國家每個推薦月份的計數
            recommendedMonths.forEach(month => {
                    monthlyCounts[country][month]++;
            });
        }
    });

    // z: 計數矩陣 (z[i][j] 是第 i 個國家在第 j 個月份的計數)
    const zData = targetCountries.map(country => {
        return allMonths.map(month => monthlyCounts[country][month]);  // 對每個國家，按月份順序提取計數
    });

    return {
        x: allMonths, //月份名稱
        y: targetCountries, //國家名稱
        z: zData
    };
}

function drawHeatmap(heatmapData) {

    let trace1 = {
        type: 'heatmap', 
        z: heatmapData.z,
        x: heatmapData.x,
        y: heatmapData.y,
        xgap: 2, // 月份格子間隔
        ygap: 10, // 國家格子間隔
        colorscale: [
            [0, 'rgba(168, 13, 13, 1)'],     // 0.0 (數據的最小值，對應紅色)
            [0.05, 'rgba(169, 220, 135, 1)'], // 0.5 (中間值，對應黃色，可選)
            [1, 'rgb(0, 100, 0)']      // 1.0 (數據的最大值，對應綠色)
        ],
        colorbar: {
            title: '推薦次數'
        }
    };

    let data = [trace1];

    let layout = {
        title:{text:'中日韓 - 月份推薦次數熱點圖'},
        xaxis: { title: '月份',},
        yaxis: { 
            title: '國家',
            autorange: 'reversed', // 反轉 y 軸順序
        },
        margin: { t: 100, b: 70, l: 100, r: 50 } 
    };

    Plotly.newPlot('myHeatGraph', data, layout);
}
