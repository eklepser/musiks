const API_URL = 'https://localhost:7062/api/Manufacturers';
const tbody = document.getElementById('manufacturer-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const nameInput = document.getElementById('name');
const contactInput = document.getElementById('contact-info');
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
    contactInput.value = '';
    editIdField.value = '';
    currentEditId = null;
    formTitle.textContent = 'Добавить производителя';
    submitBtn.textContent = 'Добавить';
    cancelBtn.style.display = 'none';
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let items = await response.json();
        items.sort((a, b) => a.manufacturer_id - b.manufacturer_id);
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
            return;
        }
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.manufacturer_id;
            row.insertCell(1).textContent = item.name;
            row.insertCell(2).textContent = item.contact_info || '';
            const actionsCell = row.insertCell(3);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(item);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteItem(item.manufacturer_id);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки данных</td></tr>';
    }
}

function fillFormForEdit(item) {
    nameInput.value = item.name;
    contactInput.value = item.contact_info || '';
    editIdField.value = item.manufacturer_id;
    currentEditId = item.manufacturer_id;
    formTitle.textContent = 'Редактировать производителя';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
}

async function createItem() {
    const name = nameInput.value.trim();
    if (!name) { showError('Название обязательно'); return false; }
    const data = { name: name, contact_info: contactInput.value.trim() || null };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Производитель добавлен');
        return true;
    } catch (err) {
        showError('Ошибка добавления: ' + err.message);
        return false;
    }
}

async function updateItem(id) {
    const name = nameInput.value.trim();
    if (!name) { showError('Название обязательно'); return false; }
    const data = { manufacturer_id: id, name: name, contact_info: contactInput.value.trim() || null };
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Производитель обновлен');
        return true;
    } catch (err) {
        showError('Ошибка обновления: ' + err.message);
        return false;
    }
}

async function deleteItem(id) {
    if (!confirm('Удалить производителя?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await renderTable();
        showSuccess('Производитель удален');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateItem(currentEditId);
    else await createItem();
}

function onCancel() { clearForm(); }

submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
renderTable();