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
        tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Нет данных</tbody>';
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
        editBtn.textContent = 'Редактировать';
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

function validateFieldOnDemand(element, validator, required) {
    if (!element) return;
    const value = element.type === 'checkbox' ? element.checked : element.value;
    if (!required && (!value || value.toString().trim() === '')) {
        if (typeof clearFieldValidity === 'function') clearFieldValidity(element);
        return;
    }
    const error = validator(value);
    if (typeof setFieldValidity === 'function') setFieldValidity(element, !error, error);
}

function fillUserForm(user) {
    if (typeof openAddSection === 'function') {
        openAddSection('.add-section-card');
    }
    const loginInput = document.getElementById('user-login');
    const emailInput = document.getElementById('user-email');
    const fullNameInput = document.getElementById('user-full-name');
    const passwordInput = document.getElementById('user-password');
    const editIdInput = document.getElementById('user-edit-id');

    if (loginInput) loginInput.value = user.login;
    if (emailInput) emailInput.value = user.email;
    if (fullNameInput) fullNameInput.value = user.full_name;
    if (passwordInput) passwordInput.value = '';
    if (editIdInput) editIdInput.value = user.user_id;

    currentEditUserId = user.user_id;

    const formTitle = document.getElementById('user-form-title');
    const submitBtn = document.getElementById('user-submit');
    const cancelBtn = document.getElementById('user-cancel');

    if (formTitle) formTitle.innerText = 'Редактировать пользователя';
    if (submitBtn) submitBtn.innerText = 'Сохранить';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    togglePasswordHint(true);

    setTimeout(() => {
        if (loginInput && typeof validateLogin === 'function') {
            validateFieldOnDemand(loginInput, validateLogin, true);
        }
        if (emailInput && typeof validateEmail === 'function') {
            validateFieldOnDemand(emailInput, validateEmail, true);
        }
        if (fullNameInput && typeof validateFullName === 'function') {
            validateFieldOnDemand(fullNameInput, validateFullName, true);
        }
        if (passwordInput && typeof validatePassword === 'function') {
            validateFieldOnDemand(passwordInput, (v) => validatePassword(v, false), false);
        }
    }, 10);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearUserForm() {
    const loginInput = document.getElementById('user-login');
    const emailInput = document.getElementById('user-email');
    const fullNameInput = document.getElementById('user-full-name');
    const passwordInput = document.getElementById('user-password');
    const editIdInput = document.getElementById('user-edit-id');
    const formTitle = document.getElementById('user-form-title');
    const submitBtn = document.getElementById('user-submit');
    const cancelBtn = document.getElementById('user-cancel');

    if (loginInput) loginInput.value = '';
    if (emailInput) emailInput.value = '';
    if (fullNameInput) fullNameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (editIdInput) editIdInput.value = '';

    currentEditUserId = null;

    if (formTitle) formTitle.innerText = 'Добавить пользователя';
    if (submitBtn) submitBtn.innerText = 'Добавить';
    if (cancelBtn) cancelBtn.style.display = 'none';

    togglePasswordHint(false);

    const fields = ['user-login', 'user-email', 'user-full-name', 'user-password'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });
}

function initUserLiveValidation() {
    const fields = [
        { id: 'user-login', required: true, validator: (v) => validateLogin(v) },
        { id: 'user-email', required: true, validator: (v) => validateEmail(v) },
        { id: 'user-full-name', required: true, validator: (v) => validateFullName(v) },
        { id: 'user-password', required: false, validator: (v) => validatePassword(v, false) }
    ];
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && typeof attachLiveValidation === 'function') {
            attachLiveValidation(el, f.validator, f.required);
        }
    });
}

function validateLogin(login) {
    if (!login || login.trim() === '') return 'Логин обязателен';
    if (login.length < 3 || login.length > 50) return 'Логин должен содержать от 3 до 50 символов';
    if (/^\d+$/.test(login.trim())) return 'Логин не может состоять только из цифр';
    if (!/^[a-zA-Z0-9_-]+$/.test(login.trim())) return 'Логин может содержать только буквы, цифры, дефис и подчеркивание';
    return null;
}

function validateFullName(fullName) {
    if (!fullName || fullName.trim() === '') return 'ФИО обязательно';
    if (fullName.length < 2 || fullName.length > 100) return 'ФИО должно содержать от 2 до 100 символов';
    if (/^\d+$/.test(fullName.trim())) return 'ФИО не может состоять только из цифр';
    if (fullName.trim().split(/\s+/).length < 2) return 'ФИО должно содержать минимум два слова';
    return null;
}

function validateEmail(email) {
    if (!email || email.trim() === '') return 'Email обязателен';
    if (email.length < 5 || email.length > 100) return 'Email должен содержать от 5 до 100 символов';
    const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailPattern.test(email.trim())) return 'Введите корректный email адрес';
    return null;
}

function validatePassword(password, isRequired = true) {
    if (!isRequired && (!password || password.trim() === '')) return null;
    if (!password || password.trim() === '') return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (password.length > 50) return 'Пароль не должен превышать 50 символов';
    return null;
}

function validateUserFields(login, email, fullName, password, isUpdate = false) {
    let err = validateLogin(login);
    if (err) return err;
    err = validateEmail(email);
    if (err) return err;
    err = validateFullName(fullName);
    if (err) return err;
    err = validatePassword(password, !isUpdate);
    if (err) return err;
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
    const confirmed = await showConfirmModal({
        title: 'Удаление пользователя',
        message: `Удалить пользователя «${name}» (ID ${id})?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
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

function applyFilters() {
    renderUsersTable();
}

function clearFilters() {
    document.getElementById('sort-by').value = 'date_desc';
    renderUsersTable();
}

document.getElementById('user-submit')?.addEventListener('click', saveUser);
document.getElementById('user-cancel')?.addEventListener('click', clearUserForm);
document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
document.getElementById('clear-filters')?.addEventListener('click', clearFilters);

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    initUserLiveValidation();
    setTimeout(function () {
        if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
        if (typeof window.initToggleAddSections === 'function') window.initToggleAddSections();
    }, 100);
});