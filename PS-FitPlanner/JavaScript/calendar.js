import {getUserRoutines, getRoutines, addUserRoutine, deleteUserRoutine, editUserRoutine} from "./GetDB/getUserRoutines.js";
import {getUserProfile} from "./GetDB/getUser.js";
import {deleteDoc, doc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "./firebase_config.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';

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
            var rutinaUsuarioSeleccionada
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
                events: events,
                dateClick: function (info) {
                    $('#eventModal').modal('show');
                    $('#eventDate').val(info.dateStr + 'T09:00');
                },
                eventClick: function (info) {
                    let selectedEvent = info.event;
                    console.log(selectedEvent.title)
                    routines.forEach(function (rutina) {
                        if (selectedEvent.title === rutina.name) {
                            rutinaSeleccionada = rutina
                        }
                    });
                    userRoutines.forEach(function (rutinaUsuario) {
                        const nuevaFecha = new Date(selectedEvent.start.getTime() + 60 * 60 * 1000);
                        const resultado = nuevaFecha.toISOString().slice(0, 16);
                        console.log();
                        console.log();
                        if (rutinaSeleccionada.name === rutinaUsuario.rutine.name && resultado === rutinaUsuario.date) {
                            rutinaUsuarioSeleccionada = rutinaUsuario
                        }
                    });
                    $('#editEventDate').val(selectedEvent.start.toISOString().slice(0, 16));
                    $('#editEventRutine').val(rutinaSeleccionada.id);
                    $('#editEventRemember').val(rutinaUsuarioSeleccionada.rememberDays);
                    $('#editEventColor').val(rutinaUsuarioSeleccionada.color);
                    $('#editEventModal').modal('show');
                }, eventDrop: function (info) {
                    var rutine = userRoutines.find(function (r) {
                        return r.id == info.event.id;
                    });
                    editUserRoutine(user, rutine.rutine, convertirFecha(info.event.start), rutine.id, rutine.rememberDays, rutine.color)
                },
                eventContent: function(arg) {
                    var rutine = userRoutines.find(function (r) {
                        return r.id == arg.event.id;
                    });
                    return {
                        html: `<div class="custom-event-dot" style="background-color: ${rutine.color}" data-title="${arg.event.title}"></div>`
                    };
                },
                eventMouseEnter: function(info) {
                    // Mostrar el título en la pestaña flotante al pasar el ratón
                    var eventTitle = info.event.title;
                    var tooltip = document.getElementById('titleTooltip');
                    var tooltipTitle = document.getElementById('tooltipTitle');

                    tooltipTitle.textContent = eventTitle; // Establecer el título en el tooltip
                    tooltip.style.display = 'block'; // Mostrar la pestaña flotante

                    // Posicionar el tooltip cerca del punto del evento
                    var rect = info.el.getBoundingClientRect();
                    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px'; // Centrado horizontal
                    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px'; // Justo encima del punto
                },
                eventMouseLeave: function(info) {
                    // Ocultar el tooltip cuando el ratón salga del punto
                    var tooltip = document.getElementById('titleTooltip');
                    tooltip.style.display = 'none';
                }
            });
            calendar.render();
            console.log(document.getElementsByClassName('custom-event-dot'));


            // Función para agregar un evento desde el formulario
            $('#eventForm').on('submit', function (e) {
                e.preventDefault();

                var eventDate = $('#eventDate').val();
                var rutineId = $('#eventRutine').val();
                var remember = $('#eventRemember').val();
                var color = $('#eventColor').val();
                var rutine = routines.find(function (r) {
                    return r.id == rutineId;
                });
                addUserRoutine(user, rutine, eventDate, remember, color)
            });

            // Editar evento
            $('#editEventForm').on('submit', function (e) {
                e.preventDefault();

                var eventDate = $('#editEventDate').val();
                var rutineIdNew = $('#editEventRutine').val();
                var remember = $('#editEventRemember').val();
                var color = $('#editEventColor').val();
                var rutineId = rutinaSeleccionada.id
                var rutineNew = routines.find(function (r) {
                    return r.id == rutineIdNew;
                });
                var rutine = userRoutines.find(function (r) {
                    return r.rutine.id == rutineId;
                });
                console.log(remember)
                editUserRoutine(user, rutineNew, eventDate, rutine.id, remember, color)
            });

            // Eliminar evento
            $('#deleteEventButton').on('click', function () {
                var rutineId = rutinaSeleccionada.id
                var rutine = userRoutines.find(function (r) {
                    return r.rutine.id == rutineId;
                })
                Swal.fire({
                    title: "¿Delete this routine?",
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete",
                    denyButtonText: `Don't delete`
                }).then(async (result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        deleteUserRoutine(rutine.id)
                    } else if (result.isDenied) {
                        return;
                    }
                });

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
        const progresoSemanal = dividirPasadasYFuturas(rutinasSemanaActual);
        let porcentajeMensual
        let porcentajeSemanal
        if (progresoMensual.pasadas === 0 && progresoMensual.total === 0){
            porcentajeMensual = 100;
            document.getElementById('progress-label-month').textContent = `No han habido rutinas este mes`;
            document.getElementById('progress-bar-month').style.width = `${porcentajeMensual}%`;

        } else{
            porcentajeMensual = (progresoMensual.pasadas / progresoMensual.total) * 100;
            document.getElementById('progress-label-month').textContent = `Progreso mensual: ${progresoMensual.pasadas} / ${progresoMensual.total}`;
            document.getElementById('progress-bar-month').style.width = `${porcentajeMensual}%`;
        }
        if (progresoSemanal.pasadas === 0 && progresoSemanal.total === 0){
            porcentajeSemanal = 100;
            document.getElementById('progress-label-week').textContent = `No han habido rutinas esta semana`;
            document.getElementById('progress-bar-week').style.width = `${porcentajeSemanal}%`;

        } else{
            porcentajeSemanal = (progresoSemanal.pasadas / progresoSemanal.total) * 100;
            document.getElementById('progress-label-week').textContent = `Progreso semanal: ${progresoSemanal.pasadas} / ${progresoSemanal.total}`;
            document.getElementById('progress-bar-week').style.width = `${porcentajeSemanal}%`;
        }




        console.log(progresoMensual)
        console.log(progresoSemanal)

    });

});