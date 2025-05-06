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
        console.log(userRoutines)

    });

});