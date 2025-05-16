google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => initChart('routines', 'month'));

let currentChart = null;
let userPeso = 0;

async function initChart(_, range) {
    try {
        const { getUserProfile } = await import('../JavaScript/GetDB/getUser.js');
        const { getUserRoutines } = await import('../JavaScript/GetDB/getUserRoutines.js');

        const user = await getUserProfile();
        console.log("Perfil del usuario recibido:", user);

        userPeso = user && user.peso != null ? parseFloat(user.peso) : 0;
        console.log("Peso del usuario:", userPeso);

        const routines = await getUserRoutines(user.email);
        console.log("Rutinas del usuario:", routines);

        loadRoutineData(routines, range);
    } catch (error) {
        console.warn("Error al obtener datos del usuario o rutinas:", error);
        userPeso = 0;
        loadRoutineData([], range);
    }
}

function loadRoutineData(routines, range = 'month') {
    const parsedData = routines.map(r => {
        const dateObj = new Date(r.date);
        const day = dateObj.getDate().toString();
        const durationMin = parseDurationToMinutes(r.rutine.duration);
        const met = 6;

        return {
            dia: day,
            met: met,
            minutos: durationMin
        };
    });

    drawChart(parsedData, 'routines', range);
}

function parseDurationToMinutes(durationStr) {
    const match = durationStr.match(/(?:(\d+)h)?\s*(?:(\d+)min)?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
}

function drawChart(dataArray, filename, range) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');

    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const isWeek = (range === 'week');
    let title, vAxisTitle;
    let allDays = [];

    if (isWeek) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            allDays.push(d.getDate().toString());
        }
    } else {
        const daysinMonth = new Date(year, now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysinMonth; i++) {
            allDays.push(i.toString());
        }
    }

    const dataMap = {};
    dataArray.forEach(item => {
        const dia = parseInt(item.dia).toString();
        dataMap[dia] = item;
    });

    if (filename === 'routines') {
        data.addColumn('number', 'Calories Burn');
        title = isWeek
            ? 'Calories Burn - Last 7 Days'
            : `Calories Burn per Day - ${monthName} ${year}`;
        vAxisTitle = 'Calories';

        allDays.forEach(day => {
            if (dataMap[day]) {
                const item = dataMap[day];
                const caloriasQuemadas = calcularCalorias(item.met, userPeso, item.minutos);
                data.addRow([day, caloriasQuemadas]);
            } else {
                data.addRow([day, 0]);
            }
        });
    } else {
        data.addColumn('number', 'Steps');
        title = isWeek
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

    const options = {
        title: title,
        hAxis: { title: 'Day of the Month' },
        vAxis: { title: vAxisTitle },
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

function downloadChart() {
    if (currentChart) {
        const imageURI = currentChart.getImageURI();
        const link = document.createElement('a');
        link.href = imageURI;
        link.download = 'graphic.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("There is not any graphic available to download");
    }
}
