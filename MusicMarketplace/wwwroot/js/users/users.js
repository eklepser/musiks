const USERS_URL = 'https://localhost:7062/api/Users';
let usersData = [];
let currentEditUserId = null;

async function loadUsers() {
    try {
        const resp = await fetch(USERS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        usersData = await resp.json();
        renderUsersTable();
        updateUserSelects();
    } catch (err) {
        console.error(err);
        showToast('Ошибка загрузки пользователей', 'error');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (usersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Нет данных</td></tr>';
        document.getElementById('found-count').innerText = '0';
        return;
    }

    document.getElementById('found-count').innerText = usersData.length;

    usersData.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = user.user_id;
        row.insertCell(1).textContent = user.login;
        row.insertCell(2).textContent = user.full_name;
        row.insertCell(3).textContent = user.email;
        row.insertCell(4).textContent = new Date(user.registration_date).toLocaleDateString();

        const actions = row.insertCell(5);
        const btnRow = document.createElement('div');
        btnRow.className = 'action-buttons-row';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => fillUserForm(user);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteUser(user.user_id, user.full_name);

        btnRow.append(editBtn, delBtn);
        actions.appendChild(btnRow);
    });
}

function updateUserSelects() {
    const selects = document.querySelectorAll('#user-select');
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Выберите пользователя --</option>';
        usersData.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user.user_id;
            opt.textContent = `${user.full_name} (${user.login})`;
            select.appendChild(opt);
        });
        if (currentValue) select.value = currentValue;
    });
}

function togglePasswordHint(isEditing) {
    const passwordInput = document.getElementById('user-password');
    const passwordHint = document.getElementById('password-hint');

    if (isEditing) {
        passwordInput.placeholder = 'Пароль';
        passwordHint.style.display = 'inline';
    } else {
        passwordInput.placeholder = 'Пароль*';
        passwordHint.style.display = 'none';
    }
}

function fillUserForm(user) {
    document.getElementById('user-login').value = user.login;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-full-name').value = user.full_name;
    document.getElementById('user-password').value = '';
    document.getElementById('user-edit-id').value = user.user_id;

    currentEditUserId = user.user_id;

    document.getElementById('user-form-title').innerText = 'Редактировать пользователя';
    document.getElementById('user-submit').innerText = 'Сохранить';
    document.getElementById('user-cancel').style.display = 'inline-block';

    togglePasswordHint(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearUserForm() {
    document.getElementById('user-login').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-full-name').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-edit-id').value = '';

    currentEditUserId = null;

    document.getElementById('user-form-title').innerText = 'Добавить пользователя';
    document.getElementById('user-submit').innerText = 'Добавить';
    document.getElementById('user-cancel').style.display = 'none';

    togglePasswordHint(false);
}

function validateUserFields(login, email, fullName, password, isUpdate = false) {
    if (!login || login.trim() === '') return 'Логин обязателен';
    if (login.length < 3 || login.length > 50) return 'Логин должен содержать от 3 до 50 символов';

    if (!email || email.trim() === '') return 'Email обязателен';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return 'Некорректный формат email';

    if (!fullName || fullName.trim() === '') return 'Полное имя обязательно';
    if (fullName.length < 2 || fullName.length > 100) return 'Полное имя должно содержать от 2 до 100 символов';

    // Пароль обязателен только при создании нового пользователя
    if (!isUpdate && (!password || password.trim() === '')) {
        return 'Пароль обязателен при создании пользователя';
    }
    // При редактировании пароль можно не указывать
    if (password && password.length < 6) {
        return 'Пароль должен содержать минимум 6 символов';
    }

    return null;
}

async function saveUser() {
    const login = document.getElementById('user-login').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const fullName = document.getElementById('user-full-name').value.trim();
    const password = document.getElementById('user-password').value;

    const isUpdate = currentEditUserId !== null;
    const validationError = validateUserFields(login, email, fullName, password, isUpdate);

    if (validationError) {
        showToast(validationError, 'error');
        return;
    }

    const data = {
        login: login,
        email: email,
        full_name: fullName,
        password: password || null
    };

    if (isUpdate) {
        data.user_id = currentEditUserId;
    }

    let url = USERS_URL;
    let method = 'POST';

    if (isUpdate) {
        url += `/${currentEditUserId}`;
        method = 'PUT';
    }

    try {
        const resp = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка сохранения';
            if (error.message) msg = error.message;
            else if (error.errors) {
                const errors = Object.values(error.errors).flat();
                msg = errors.join('; ');
            }
            showToast(msg, 'error');
            return;
        }

        clearUserForm();
        await loadUsers();
        showToast(`Пользователь «${fullName}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Ошибка соединения', 'error');
    }
}

async function deleteUser(id, name) {
    if (!confirm(`Удалить пользователя «${name}» (ID ${id})?`)) return;

    try {
        const resp = await fetch(`${USERS_URL}/${id}`, { method: 'DELETE' });

        if (!resp.ok) {
            const error = await resp.json();
            showToast(error.message || 'Невозможно удалить пользователя', 'error');
            return;
        }

        clearUserForm();
        await loadUsers();
        showToast(`Пользователь «${name}» удалён`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Ошибка удаления', 'error');
    }
}

document.getElementById('user-submit')?.addEventListener('click', saveUser);
document.getElementById('user-cancel')?.addEventListener('click', clearUserForm);
document.getElementById('apply-filters')?.addEventListener('click', () => {
    // Здесь можно добавить логику фильтрации, если нужно
    renderUsersTable();
});
document.getElementById('clear-filters')?.addEventListener('click', () => {
    document.getElementById('sort-by').value = 'date_desc';
    renderUsersTable();
});

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});