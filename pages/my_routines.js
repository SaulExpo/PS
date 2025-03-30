document.addEventListener('DOMContentLoaded', () => {
    const routines = JSON.parse(localStorage.getItem('routines')) || [];
    const list = document.getElementById('routine-list');
    list.innerHTML = '';

    if (!routines.length) {
        list.innerHTML = "<p>No tienes rutinas guardadas aún.</p>";
        return;
    }

    routines.forEach((rutina, index) => {
        const card = document.createElement('div');
        card.className = 'routine-card';

        const name = document.createElement('div');
        name.className = 'routine-name';
        name.textContent = rutina.name;

        const description = document.createElement('div');
        description.className = 'routine-description';
        description.textContent = rutina.description || 'Sin descripción.';
        description.style.fontSize = '0.9rem';
        description.style.color = '#555';

        const actions = document.createElement('div');
        actions.className = 'routine-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Editar';
        editBtn.onclick = () => {
            localStorage.setItem('editIndex', index);
            window.location.href = 'exercise_selector.html';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.onclick = () => {
            if (confirm('¿Eliminar esta rutina?')) {
                routines.splice(index, 1);
                localStorage.setItem('routines', JSON.stringify(routines));
                location.reload();
            }
        };

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(actions);
        list.appendChild(card);
    });
});
