const USERS_URL = 'https://localhost:7062/api/Users';
const USERS_FILTER_URL = 'https://localhost:7062/api/Users/filter';
let editUserId = null;

// Загрузка подсказок для поиска
async function loadUserSearchSuggestions() {
    try {
        const resp = await fetch(USERS_URL);
        if (resp.ok) {
            const users = await resp.json();
            const datalist = document.getElementById('user-search-datalist');
            if (datalist) {
                datalist.innerHTML = '';
                users.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.login; // Подсказка по логину
                    datalist.appendChild(opt);
                    // Можно добавить и ФИО, но datalist дедуплицирует одинаковые value
                    // Для простоты используем логин, так как он уникален
                });
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// Основная функция загрузки таблицы
async function loadUsersTable() {
    const search = document.getElementById('search-user').value.trim();
    const sortBy = document.getElementById('user-sort').value; // Берет значение из селекта (по умолчанию date_desc)

    let url = `${USERS_FILTER_URL}?`;
    if (search) url += `searchName=${encodeURIComponent(search)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const users = await resp.json();
        const tbody = document.getElementById('users-tbody');
        const countSpan = document.getElementById('user-found-count');
        if (!tbody) return;
        tbody.innerHTML = '';
        countSpan.innerText = users.length;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Нет данных</td></tr>';
            return;
        }

        users.forEach(user => {
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
            delBtn.onclick = () => deleteUser(user.user_id, user.login);
            btnRow.append(editBtn, delBtn);
            actions.appendChild(btnRow);
        });
    } catch (err) {
        console.error(err);
        document.getElementById('users-tbody').innerHTML = '<tr><td colspan="6" class="centered-message">Ошибка загрузки</td></tr>';
    }
}

function fillUserForm(user) {
    document.getElementById('user-login').value = user.login;
    document.getElementById('user-full-name').value = user.full_name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-password').value = ''; // Очищаем поле пароля при редактировании
    document.getElementById('user-edit-id').value = user.user_id;
    document.getElementById('user-form-title').innerText = 'Редактировать пользователя';
    document.getElementById('user-submit').innerText = 'Сохранить';
    document.getElementById('user-cancel').style.display = 'inline-block';
    editUserId = user.user_id;
}

function clearUserForm() {
    document.getElementById('user-login').value = '';
    document.getElementById('user-full-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-edit-id').value = '';
    document.getElementById('user-form-title').innerText = 'Добавить пользователя';
    document.getElementById('user-submit').innerText = 'Добавить';
    document.getElementById('user-cancel').style.display = 'none';
    editUserId = null;
}

async function saveUser() {
    const login = document.getElementById('user-login').value.trim();
    const fullName = document.getElementById('user-full-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value; // Может быть пустым при редактировании

    let err = validateRequiredString(login, 'Логин', 3, 50, true);
    if (err) { showToast(err, 'error'); return; }
    err = validateRequiredString(fullName, 'ФИО', 2, 100, true);
    if (err) { showToast(err, 'error'); return; }
    err = validateRequiredString(email, 'Email', 5, 100, true);
    if (err) { showToast(err, 'error'); return; }

    // Валидация пароля только при создании
    if (!editUserId && (!password || password.trim() === '')) {
        showToast('Пароль обязателен при создании', 'error'); return;
    }

    const data = {
        login: login,
        full_name: fullName,
        email: email
    };
    // Передаем пароль только если он не пустой (или если это создание)
    if (password.trim() !== '') {
        data.password = password;
    }

    if (editUserId) data.user_id = editUserId;

    let url = USERS_URL, method = 'POST';
    if (editUserId) { url += `/${editUserId}`; method = 'PUT'; }

    try {
        const resp = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const errData = await resp.json();
            showToast(errData.message || 'Пользователь уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        clearUserForm();
        await loadUsersTable();
        showToast('Пользователь сохранен', 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteUser(id, login) {
    if (!confirm(`Удалить пользователя ${login}?`)) return;
    try {
        const resp = await fetch(`${USERS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadUsersTable();
        showToast('Пользователь удален', 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

// Инициализация
document.getElementById('user-submit').addEventListener('click', saveUser);
document.getElementById('user-cancel').addEventListener('click', clearUserForm);
document.getElementById('apply-user-filters').addEventListener('click', loadUsersTable);
document.getElementById('clear-user-filters').addEventListener('click', () => {
    document.getElementById('search-user').value = '';
    document.getElementById('user-sort').value = 'date_desc'; // Сброс на дефолтную сортировку
    loadUsersTable();
});

loadUsersTable();
loadUserSearchSuggestions(); // Загружаем список для datalist