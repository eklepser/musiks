const API_URL = 'https://localhost:7062/api/Artists';
const tbody = document.getElementById('artist-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const nameInput = document.getElementById('name');
const countryInput = document.getElementById('country');
const debutInput = document.getElementById('debut-year');
const langInput = document.getElementById('language');
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
    countryInput.value = '';
    debutInput.value = '';
    langInput.value = '';
    editIdField.value = '';
    currentEditId = null;
    formTitle.textContent = 'Добавить исполнителя';
    submitBtn.textContent = 'Добавить';
    cancelBtn.style.display = 'none';
    nameInput.required = true;
}

function formatDate(dateString) { return dateString ? new Date(dateString).toLocaleDateString() : ''; }

function validateForm(isEdit) {
    const name = nameInput.value.trim();
    if (!name) { showError('Имя обязательно'); return false; }
    if (name.length > 100) { showError('Имя не может быть длиннее 100 символов'); return false; }
    const debut = debutInput.value;
    if (debut) {
        const year = parseInt(debut);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 1) {
            showError(`Год дебюта должен быть между 1900 и ${currentYear + 1}`);
            return false;
        }
    }
    return true;
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let artists = await response.json();
        artists.sort((a, b) => a.artist_id - b.artist_id);
        tbody.innerHTML = '';
        if (artists.length === 0) { tbody.innerHTML = '<table><td colspan="6">Нет данных</td></tr>'; return; }
        artists.forEach(artist => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = artist.artist_id;
            row.insertCell(1).textContent = artist.name;
            row.insertCell(2).textContent = artist.country || '';
            row.insertCell(3).textContent = artist.debut_year || '';
            row.insertCell(4).textContent = artist.language || '';
            const actionsCell = row.insertCell(5);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(artist);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteArtist(artist.artist_id);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</td></tr>';
    }
}

function fillFormForEdit(artist) {
    nameInput.value = artist.name;
    countryInput.value = artist.country || '';
    debutInput.value = artist.debut_year || '';
    langInput.value = artist.language || '';
    editIdField.value = artist.artist_id;
    currentEditId = artist.artist_id;
    formTitle.textContent = 'Редактировать исполнителя';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
    nameInput.required = true;
}

async function createArtist() {
    if (!validateForm(false)) return false;
    const artist = {
        name: nameInput.value.trim(),
        country: countryInput.value.trim() || null,
        debut_year: debutInput.value ? parseInt(debutInput.value) : null,
        language: langInput.value.trim() || null
    };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artist)
        });
        if (!response.ok) throw new Error('Ошибка ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Исполнитель добавлен');
        return true;
    } catch (err) {
        showError('Ошибка добавления: ' + err.message);
        return false;
    }
}

async function updateArtist(id) {
    if (!validateForm(true)) return false;
    const artist = {
        artist_id: id,
        name: nameInput.value.trim(),
        country: countryInput.value.trim() || null,
        debut_year: debutInput.value ? parseInt(debutInput.value) : null,
        language: langInput.value.trim() || null
    };
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artist)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Исполнитель обновлен');
        return true;
    } catch (err) {
        showError('Ошибка обновления: ' + err.message);
        return false;
    }
}

async function deleteArtist(id) {
    if (!confirm('Удалить исполнителя?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await renderTable();
        showSuccess('Исполнитель удален');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateArtist(currentEditId);
    else await createArtist();
}
function onCancel() { clearForm(); }
submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
renderTable();