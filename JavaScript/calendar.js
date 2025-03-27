document.addEventListener('DOMContentLoaded', function() {
    getUserProfile().then(user => {
        console.log(user.email);
        getRoutines(user.email).then(routines => {
            var $rutineSelect = $('#eventRutine');
            var $editEventRutineSelect = $('#editEventRutine');
            routines.forEach(function(rutina) {
                $rutineSelect.append('<option value="' + rutina.id + '">' + rutina.rutine.name + '</option>');
                $editEventRutineSelect.append('<option value="' + rutina.id + '">' + rutina.rutine.name + '</option>');

            });
            var events = routines.map(function(rutina) {
                return {
                    title: rutina.rutine.name,
                    start: rutina.date,
                    extendedProps: {
                        description: rutina.rutine.description
                    },
                    id: rutina.id
                };
            });
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, {
                editable: true,
                droppable: true,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay,listDay'
                },
                locale: 'es',
                initialView: 'dayGridMonth',
                aspectRatio: 1.5,
                themeSystem: 'bootstrap5',
                events: events, // Cargar eventos desde el JSON
                dateClick: function(info) {
                    $('#eventModal').modal('show');
                    $('#eventStartDate').val(info.dateStr + 'T09:00'); // Establecer la fecha de inicio por defecto
                },
                eventClick: function(info) {
                    selectedEvent = info.event;
                    // Llenar el modal de edición con los datos del evento seleccionado
                    $('#editEventDate').val(selectedEvent.start.toISOString().slice(0, 16)); // Formato para datetime-local
                    $('#editEventRutine').val(selectedEvent.id); // Setear la rutina seleccionada
                    $('#editEventModal').modal('show');
                }
            });
            calendar.render();

            // Función para agregar un evento desde el formulario
            $('#eventForm').on('submit', function(e) {
                e.preventDefault();

                var eventDate = $('#eventDate').val();
                var rutineId = $('#eventRutine').val();
                var rutine = routines.find(function(r) { return r.id == rutineId; });
                console.log(rutine.rutine)
                addUserRoutine(user, rutine.rutine, eventDate)
            });

            // Editar evento
            $('#editEventForm').on('submit', function(e) {
                e.preventDefault();

                var eventDate = $('#editEventDate').val();
                var rutineIdNew = $('#editEventRutine').val();
                var rutineId = selectedEvent.id
                var rutineNew = routines.find(function(r) { return r.id == rutineId2; });
                var rutine = routines.find(function(r) { return r.id == rutineId; });

                editUserRoutine(user, rutineNew, eventDate, rutine.documentId)
            });

            // Eliminar evento
            $('#deleteEventButton').on('click', function() {
                var rutineId = selectedEvent.id
                var rutine = routines.find(function(r) { return r.id == rutineId; })
                deleteUserRoutine(rutine.documentId)
            });
        });
    })

});