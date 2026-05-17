const API_URL = 'https://localhost:7062/api/Genres';
const tbody = document.getElementById('genre-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const nameInput = document.getElementById('name');
const descInput = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editIdField = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');

let currentEditId = null;

function showError(text) {
    errorDiv.textContent = text;
    errorDiv.classList.add('show');
    successDiv.classList.remove('show');
    setTimeout(() => errorDiv.classList.remove('show'), 5000);
}

function showSuccess(text) {
    successDiv.textContent = text;
    successDiv.classList.add('show');
    errorDiv.classList.remove('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
}

function clearForm() {
    nameInput.value = '';
    descInput.value = '';
    editIdField.value = '';
    currentEditId = null;
    formTitle.textContent = 'Добавить жанр';
    submitBtn.textContent = 'Добавить';
    cancelBtn.style.display = 'none';
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let genres = await response.json();
        genres.sort((a, b) => a.genre_id - b.genre_id);
        tbody.innerHTML = '';
        if (genres.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
            return;
        }
        genres.forEach(genre => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = genre.genre_id;
            row.insertCell(1).textContent = genre.name;
            row.insertCell(2).textContent = genre.description || '';
            const actionsCell = row.insertCell(3);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(genre);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteGenre(genre.genre_id);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки данных</td></tr>';
    }
}

function fillFormForEdit(genre) {
    nameInput.value = genre.name;
    descInput.value = genre.description || '';
    editIdField.value = genre.genre_id;
    currentEditId = genre.genre_id;
    formTitle.textContent = 'Редактировать жанр';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
}

async function createGenre() {
    const name = nameInput.value.trim();
    if (!name) { showError('Название обязательно'); return false; }
    const genre = { name: name, description: descInput.value.trim() || null };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(genre)
        });
        if (!response.ok) throw new Error('Ошибка ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Жанр добавлен');
        return true;
    } catch (err) {
        showError('Ошибка добавления: ' + err.message);
        return false;
    }
}

async function updateGenre(id) {
    const name = nameInput.value.trim();
    if (!name) { showError('Название обязательно'); return false; }
    const genre = { genre_id: id, name: name, description: descInput.value.trim() || null };
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(genre)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Жанр обновлен');
        return true;
    } catch (err) {
        showError('Ошибка обновления: ' + err.message);
        return false;
    }
}

async function deleteGenre(id) {
    if (!confirm('Удалить жанр?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await renderTable();
        showSuccess('Жанр удален');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateGenre(currentEditId);
    else await createGenre();
}

function onCancel() { clearForm(); }

submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
renderTable();