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

function validateForm() {
    const title = titleInput.value.trim();
    const venue = venueInput.value.trim();
    const datetime = datetimeInput.value;
    if (!title) { showError('Название обязательно'); return false; }
    if (title.length > 150) { showError('Название не может быть длиннее 150 символов'); return false; }
    if (!venue) { showError('Место проведения обязательно'); return false; }
    if (venue.length > 100) { showError('Место не может быть длиннее 100 символов'); return false; }
    if (!datetime) { showError('Дата и время обязательны'); return false; }
    return true;
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let concerts = await response.json();
        concerts.sort((a, b) => a.concert_id - b.concert_id);
        tbody.innerHTML = '';
        if (concerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Нет данных</td></td>';
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
    if (!validateForm()) return false;
    const data = { title: titleInput.value.trim(), venue: venueInput.value.trim(), datetime: datetimeInput.value };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.status === 409) {
            const text = await response.text();
            let msg = text;
            try { const json = JSON.parse(text); msg = json.title || json.message || text; } catch (e) { }
            showError(msg);
            return false;
        }
        if (response.status === 400) {
            const text = await response.text();
            let errors = '';
            try {
                const json = JSON.parse(text);
                if (json.errors) {
                    for (const field in json.errors) {
                        errors += `${field}: ${json.errors[field].join(', ')}\n`;
                    }
                }
                showError(errors || json.title || 'Некорректные данные');
            } catch (e) {
                showError(text || 'Ошибка валидации');
            }
            return false;
        }
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
    if (!validateForm()) return false;
    const data = { title: titleInput.value.trim(), venue: venueInput.value.trim(), datetime: datetimeInput.value };
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.status === 409) {
            const text = await response.text();
            let msg = text;
            try { const json = JSON.parse(text); msg = json.title || json.message || text; } catch (e) { }
            showError(msg);
            return false;
        }
        if (response.status === 400) {
            const text = await response.text();
            let errors = '';
            try {
                const json = JSON.parse(text);
                if (json.errors) {
                    for (const field in json.errors) {
                        errors += `${field}: ${json.errors[field].join(', ')}\n`;
                    }
                }
                showError(errors || json.title || 'Некорректные данные');
            } catch (e) {
                showError(text || 'Ошибка валидации');
            }
            return false;
        }
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