const API_URL = 'https://localhost:7062/api/Users';
const tbody = document.getElementById('user-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const loginInput = document.getElementById('login');
const emailInput = document.getElementById('email');
const fullNameInput = document.getElementById('full-name');
const passwordInput = document.getElementById('password');
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
    loginInput.value = '';
    emailInput.value = '';
    fullNameInput.value = '';
    passwordInput.value = '';
    editIdField.value = '';
    currentEditId = null;
    formTitle.textContent = 'Добавить пользователя';
    submitBtn.textContent = 'Добавить';
    cancelBtn.style.display = 'none';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString();
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        let users = await response.json();
        users.sort((a, b) => a.user_id - b.user_id);
        tbody.innerHTML = '';
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = user.user_id;
            row.insertCell(1).textContent = user.login;
            row.insertCell(2).textContent = user.email;
            row.insertCell(3).textContent = user.full_name;
            row.insertCell(4).textContent = formatDate(user.registration_date);
            const actionsCell = row.insertCell(5);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(user);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteUser(user.user_id);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</td></tr>';
    }
}

function fillFormForEdit(user) {
    loginInput.value = user.login;
    emailInput.value = user.email;
    fullNameInput.value = user.full_name;
    passwordInput.value = '';
    editIdField.value = user.user_id;
    currentEditId = user.user_id;
    formTitle.textContent = 'Редактировать пользователя';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
}

async function createUser() {
    const login = loginInput.value.trim();
    const email = emailInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const password = passwordInput.value;
    if (!login || !email || !fullName) { showError('Заполните все обязательные поля'); return false; }
    const data = { login, email, full_name: fullName };
    if (password) data.password = password;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Пользователь добавлен');
        return true;
    } catch (err) {
        showError('Ошибка добавления: ' + err.message);
        return false;
    }
}

async function updateUser(id) {
    const login = loginInput.value.trim();
    const email = emailInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const password = passwordInput.value;
    if (!login || !email || !fullName) { showError('Заполните все обязательные поля'); return false; }
    const data = { user_id: id, login, email, full_name: fullName };
    if (password) data.password = password;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        clearForm();
        await renderTable();
        showSuccess('Пользователь обновлен');
        return true;
    } catch (err) {
        showError('Ошибка обновления: ' + err.message);
        return false;
    }
}

async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await renderTable();
        showSuccess('Пользователь удален');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateUser(currentEditId);
    else await createUser();
}

function onCancel() { clearForm(); }

submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
renderTable();