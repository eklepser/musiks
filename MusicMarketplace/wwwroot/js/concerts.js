const API_URL = 'https://localhost:7062/api/Concerts';
const tbody = document.getElementById('concert-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const titleInput = document.getElementById('title');
const venueInput = document.getElementById('venue');
const datetimeInput = document.getElementById('datetime');
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
    titleInput.value = '';
    venueInput.value = '';
    datetimeInput.value = '';
    editIdField.value = '';
    currentEditId = null;
    formTitle.textContent = 'Добавить концерт';
    submitBtn.textContent = 'Добавить';
    cancelBtn.style.display = 'none';
}

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let concerts = await response.json();
        concerts.sort((a, b) => a.concert_id - b.concert_id);
        tbody.innerHTML = '';
        if (concerts.length === 0) {
            tbody.innerHTML = '<td><td colspan="5">Нет данных</td></tr>';
            return;
        }
        concerts.forEach(concert => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = concert.concert_id;
            row.insertCell(1).textContent = concert.title;
            row.insertCell(2).textContent = concert.venue;
            const dateStr = concert.datetime ? new Date(concert.datetime).toLocaleString() : '';
            row.insertCell(3).textContent = dateStr;
            const actionsCell = row.insertCell(4);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(concert);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteConcert(concert.concert_id);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="5">Ошибка загрузки данных</td></tr>';
    }
}

function fillFormForEdit(concert) {
    titleInput.value = concert.title;
    venueInput.value = concert.venue;
    datetimeInput.value = formatDateTimeLocal(concert.datetime);
    editIdField.value = concert.concert_id;
    currentEditId = concert.concert_id;
    formTitle.textContent = 'Редактировать концерт';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
}

async function createConcert() {
    const title = titleInput.value.trim();
    const venue = venueInput.value.trim();
    const datetime = datetimeInput.value;
    if (!title || !venue || !datetime) { showError('Заполните все поля'); return false; }
    const concert = { title, venue, datetime };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(concert)
        });
        if (!response.ok) throw new Error('Ошибка ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Концерт добавлен');
        return true;
    } catch (err) {
        showError('Ошибка добавления: ' + err.message);
        return false;
    }
}

async function updateConcert(id) {
    const title = titleInput.value.trim();
    const venue = venueInput.value.trim();
    const datetime = datetimeInput.value;
    if (!title || !venue || !datetime) { showError('Заполните все поля'); return false; }
    const concert = { concert_id: id, title, venue, datetime };
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(concert)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Концерт обновлен');
        return true;
    } catch (err) {
        showError('Ошибка обновления: ' + err.message);
        return false;
    }
}

async function deleteConcert(id) {
    if (!confirm('Удалить концерт?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await renderTable();
        showSuccess('Концерт удален');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateConcert(currentEditId);
    else await createConcert();
}

function onCancel() { clearForm(); }

submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
renderTable();