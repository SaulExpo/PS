google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(() => loadData('../JavaScript/calorias.js', 'month'));

function loadData(filename, range = 'month') {
    fetch(filename)
        .then(response => response.json())
        .then(data => {
            if (range === 'week') {
                data = data.slice(-7);
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

    let title, vAxisTitle;

    const daysinMonth = new Date(year, now.getMonth()+1, 0).getDate();
    const allDays = [];
    for(let i = 1; i <= daysinMonth; i++) {
        allDays.push(i.toString().padStart(2, '0'));
    }

    const dataMap = {};
    dataArray.forEach(item => {
        dataMap[item.dia] = item;
    });

    if (filename === '../JavaScript/calorias.js') {
        data.addColumn('number', 'Calories Burn');
        title = 'Calories Burn per Day';
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
        title = `Steps Done per Day - ${monthName} ${year}`;
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


    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function calcularCalorias(met, peso, minutos) {
    return ((met * peso * 3.5) / 200) * minutos;
}