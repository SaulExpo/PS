import {getUserRoutines, getRoutines, addUserRoutine, deleteUserRoutine, editUserRoutine} from "./GetDB/getUserRoutines.js";
import {getUserProfile} from "./GetDB/getUser.js";

function convertirFecha(fecha) {
    const date = new Date(fecha);

    // Obtener los componentes con cero inicial si es necesario
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${año}-${mes}-${dia}T${horas}:${minutos}`;
}

// Ejemplo de uso:
const fechaOriginal = "Tue May 06 2025 09:00:00 GMT+0100";
const fechaConvertida = convertirFecha(fechaOriginal);

document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "../Pages/login.html"
    }

    const user = await getUserProfile();
    console.log(user.email);
    getUserRoutines(user.email).then(userRoutines => {
        getRoutines().then(routines => {
            console.log(routines);
            var $rutineSelect = $('#eventRutine');
            var $editEventRutineSelect = $('#editEventRutine');
            routines.forEach(function (rutina) {
                $rutineSelect.append('<option value="' + rutina.id + '">' + rutina.name + '</option>');
                $editEventRutineSelect.append('<option value="' + rutina.id + '">' + rutina.name + '</option>');
            });
            console.log(userRoutines)

            var events = userRoutines.map(function (rutina) {
                return {
                    title: rutina.rutine.name,
                    start: rutina.date,
                    extendedProps: {
                        description: rutina.rutine.description
                    },
                    id: rutina.id
                };
            });
            var rutinaSeleccionada
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, {
                editable: true,
                droppable: true,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay,listDay'
                },
                locale: 'en',
                initialView: 'dayGridMonth',
                aspectRatio: 1.5,
                themeSystem: 'bootstrap5',
                events: events, // Cargar eventos desde el JSON
                dateClick: function (info) {
                    $('#eventModal').modal('show');
                    $('#eventDate').val(info.dateStr + 'T09:00'); // Establecer la fecha de inicio por defecto
                },
                eventClick: function (info) {
                    let selectedEvent = info.event;
                    console.log(selectedEvent.title)
                    routines.forEach(function (rutina) {
                        if (selectedEvent.title === rutina.name) {
                            rutinaSeleccionada = rutina
                        }
                    });
                    // Llenar el modal de edición con los datos del evento seleccionado
                    $('#editEventDate').val(selectedEvent.start.toISOString().slice(0, 16)); // Formato para datetime-local
                    $('#editEventRutine').val(rutinaSeleccionada.id); // Setear la rutina seleccionada
                    $('#editEventModal').modal('show');
                }, eventDrop: function (info) {
                    var rutine = userRoutines.find(function (r) {
                        return r.id == info.event.id;
                    });
                    editUserRoutine(user, rutine.rutine, convertirFecha(info.event.start), rutine.id)
                }
            });
            calendar.render();

            // Función para agregar un evento desde el formulario
            $('#eventForm').on('submit', function (e) {
                e.preventDefault();

                var eventDate = $('#eventDate').val();
                var rutineId = $('#eventRutine').val();
                var rutine = routines.find(function (r) {
                    return r.id == rutineId;
                });
                addUserRoutine(user, rutine, eventDate)
            });

            // Editar evento
            $('#editEventForm').on('submit', function (e) {
                e.preventDefault();

                var eventDate = $('#editEventDate').val();
                var rutineIdNew = $('#editEventRutine').val();
                var rutineId = rutinaSeleccionada.id
                var rutineNew = routines.find(function (r) {
                    return r.id == rutineIdNew;
                });
                var rutine = userRoutines.find(function (r) {
                    return r.rutine.id == rutineId;
                });

                editUserRoutine(user, rutineNew, eventDate, rutine.id)
            });

            // Eliminar evento
            $('#deleteEventButton').on('click', function () {
                var rutineId = rutinaSeleccionada.id
                var rutine = userRoutines.find(function (r) {
                    return r.rutine.id == rutineId;
                })
                deleteUserRoutine(rutine.id)
            });
        })
        function toDate(timestamp) {
            return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
        }
        function groupByWeek(data) {
            const groups = {};

            data.forEach(item => {
                const date = new Date(item.date); // usar item.date

                const monday = new Date(date);
                const day = monday.getDay();
                const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
                monday.setDate(diff);
                monday.setHours(0, 0, 0, 0);

                const key = monday.toISOString().split('T')[0];
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            });

            return groups;
        }

        function groupByMonth(data) {
            const groups = {};

            data.forEach(item => {
                const date = new Date(item.date); // usar item.date
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "2025-04"

                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            });

            return groups;
        }
        // 📅 Fecha actual
        const now = new Date();

// 🔸 Para agrupar por mes actual:
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

// 🔸 Para agrupar por semana actual:
        function getMonday(date) {
            const monday = new Date(date);
            const day = monday.getDay();
            const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
            monday.setDate(diff);
            monday.setHours(0, 0, 0, 0);
            return monday;
        }
        const currentWeekKey = getMonday(now).toISOString().split('T')[0];
        const rutinasPorMes = groupByMonth(userRoutines);
        const rutinasPorSemana = groupByWeek(userRoutines);

        const rutinasMesActual = rutinasPorMes[currentMonthKey] || [];
        const rutinasSemanaActual = rutinasPorSemana[currentWeekKey] || [];
        function dividirPasadasYFuturas(rutinas) {
            const ahora = new Date();
            const pasadas = rutinas.filter(r => new Date(r.date) < ahora);
            const futuras = rutinas.filter(r => new Date(r.date) >= ahora);

            return {
                total: rutinas.length,
                pasadas: pasadas.length,
                futuras: futuras.length
            };
        }

        const progresoMensual = dividirPasadasYFuturas(rutinasMesActual);
        console.log(progresoMensual);
        const progresoSemanal = dividirPasadasYFuturas(rutinasSemanaActual);
        console.log(progresoSemanal);
        const porcentajeMensual = (progresoMensual.pasadas / progresoMensual.total) * 100;
        const porcentajeSemanal = (progresoSemanal.pasadas / progresoSemanal.total) * 100;

        document.getElementById('progress-label-month').textContent = `Progreso mensual: ${progresoMensual.pasadas} / ${progresoMensual.total}`;
        document.getElementById('progress-bar-month').style.width = `${porcentajeMensual}%`;
        document.getElementById('progress-label-week').textContent = `Progreso semanal: ${progresoSemanal.pasadas} / ${progresoSemanal.total}`;
        document.getElementById('progress-bar-week').style.width = `${porcentajeSemanal}%`;

        console.log(groupByWeek(userRoutines))
        console.log(groupByMonth(userRoutines))

    });

});