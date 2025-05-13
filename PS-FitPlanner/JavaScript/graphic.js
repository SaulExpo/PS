google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(() => loadData('../JavaScript/calorias.js', 'month'));

let currentChart = null;

function loadData(filename, range = 'month') {
    fetch(filename)
        .then(response => response.json())
        .then(data => {
            const today = new Date();
            if (range === 'week') {
                const last7Days = [];
                for(let i = 6; i >= 0; i--){
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const day = d.getDate().toString();
                    last7Days.push(day);
                }
                data = data.filter(item => last7Days.includes(parseInt(item.dia).toString()));
            }
            drawChart(data, filename);
        })
        .catch(error => console.error('Error cargando datos:', error));
}

function drawChart(dataArray, filename) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');

    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November','December'];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const  isWeek = dataArray.length === 7;

    let title, vAxisTitle;

    const daysinMonth = new Date(year, now.getMonth()+1, 0).getDate();
    let allDays = [];

    if(isWeek){
        for(let i = 6; i >= 0; i--){
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            allDays.push(d.getDate().toString());
        }
    } else{
        const daysinMonth = new Date(year, now.getMonth()+1, 0).getDate();
        for(let i = 1; i <= daysinMonth;i++){
            allDays.push(i.toString());
        }
    }

    const dataMap = {};
    dataArray.forEach(item => {
        const dia = parseInt(item.dia).toString();
        dataMap[dia] = item;
    });

    if (filename === '../JavaScript/calorias.js') {
        data.addColumn('number', 'Calories Burn');
        currentTitle = isWeek
            ? 'Calories Burn - Last 7 Days'
            : `Calories Burn per Day - ${monthName} ${year}`;
        vAxisTitle = 'Calories';

        allDays.forEach(day => {
            if (dataMap[day]) {
                const item = dataMap[day];
                const caloriasQuemadas = calcularCalorias(item.met, item.peso, item.minutos);
                data.addRow([day, caloriasQuemadas]);
            } else {
                data.addRow([day, 0]);
            }
        });
    } else {
        data.addColumn('number', 'Steps');
        currentTitle = isWeek
            ? 'Steps Done - Last 7 Days'
            : `Steps Done per Day - ${monthName} ${year}`;
        vAxisTitle = 'Steps';

        allDays.forEach(day => {
            if (dataMap[day]) {
                data.addRow([day, dataMap[day].valor]);
            } else {
                data.addRow([day, 0]);
            }
        });
    }

    var options = {
        title: title,
        hAxis: {title: 'Day of the Month'},
        vAxis: {title: vAxisTitle},
        legend: 'none',
        colors: ['#4285F4'],
        tooltip: {
            isHtml: false,
            textStyle: {
                fontSize: 25,
                bold: false,
                color: '#333'
            }
        }
    };

    document.getElementById('chart_div').innerHTML = '';
    document.getElementById('monthTitle').textContent = monthName + ' ' + year;


    currentChart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    currentChart.draw(data, options);
}

function calcularCalorias(met, peso, minutos) {
    return ((met * peso * 3.5) / 200) * minutos;
}



function downloadChart(){
    if(currentChart){
        const imageURI = currentChart.getImageURI();
        const link = document.createElement('a');
        link.href = imageURI;
        link.download = 'graphic.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    else{
        alert("There is not any graphic available to download");
    }
}