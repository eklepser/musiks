window.UserForm = (function () {
    let usersData = [];
    let currentEditUserId = null;

    async function loadTable() {
        const sortBy = document.getElementById('sort-by')?.value || 'date_desc';
        let url = `${window.API_URLS.USERS}/filter?sortBy=${sortBy}`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            usersData = await resp.json();
            renderTable();
            updateUserSelects();
        } catch (err) {
            console.error(err);
            window.showToast('Ошибка загрузки пользователей', 'error');
        }
    }

    function renderTable() {
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
            editBtn.onclick = () => window.UserForm.fillForm(user);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => window.UserForm.deleteItem(user.user_id, user.full_name);
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

    function fillForm(user) {
        const titleEl = document.querySelector('.add-section-card h3');
        if (titleEl) titleEl.textContent = 'Редактирование пользователя';
        document.getElementById('user-login').value = user.login;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-full-name').value = user.full_name;
        document.getElementById('user-password').value = '';
        document.getElementById('user-edit-id').value = user.user_id;
        currentEditUserId = user.user_id;
        document.getElementById('user-submit').innerText = 'Сохранить';
        document.getElementById('user-cancel').style.display = 'inline-block';
        togglePasswordHint(true);
        setTimeout(() => {
            if (document.getElementById('user-login') && typeof window.validateLogin === 'function') {
                window.validateFieldOnDemand?.(document.getElementById('user-login'), window.validateLogin, true);
            }
            if (document.getElementById('user-email') && typeof window.validateEmail === 'function') {
                window.validateFieldOnDemand?.(document.getElementById('user-email'), window.validateEmail, true);
            }
            if (document.getElementById('user-full-name') && typeof window.validateFullName === 'function') {
                window.validateFieldOnDemand?.(document.getElementById('user-full-name'), window.validateFullName, true);
            }
            if (document.getElementById('user-password') && typeof window.validatePassword === 'function') {
                window.validateFieldOnDemand?.(document.getElementById('user-password'), (v) => window.validatePassword(v, false), false);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearForm() {
        const titleEl = document.querySelector('.add-section-card h3');
        if (titleEl) titleEl.textContent = 'Добавление пользователя';
        document.getElementById('user-login').value = '';
        document.getElementById('user-email').value = '';
        document.getElementById('user-full-name').value = '';
        document.getElementById('user-password').value = '';
        document.getElementById('user-edit-id').value = '';
        currentEditUserId = null;
        document.getElementById('user-submit').innerText = 'Добавить';
        document.getElementById('user-cancel').style.display = 'none';
        togglePasswordHint(false);
        ['user-login', 'user-email', 'user-full-name', 'user-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
    }

    function validateFieldOnDemand(element, validator, required) {
        if (!element) return;
        const value = element.type === 'checkbox' ? element.checked : element.value;
        if (!required && (!value || value.toString().trim() === '')) {
            if (typeof window.clearFieldValidity === 'function') window.clearFieldValidity(element);
            return;
        }
        const error = validator(value);
        if (typeof window.setFieldValidity === 'function') window.setFieldValidity(element, !error, error);
    }

    function validateFields(login, email, fullName, password, isUpdate) {
        let err = window.validateLogin(login);
        if (err) return err;
        err = window.validateEmail(email);
        if (err) return err;
        err = window.validateFullName(fullName);
        if (err) return err;
        err = window.validatePassword(password, !isUpdate);
        if (err) return err;
        return null;
    }

    async function save() {
        const login = document.getElementById('user-login').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const fullName = document.getElementById('user-full-name').value.trim();
        const password = document.getElementById('user-password').value;
        const isUpdate = currentEditUserId !== null;
        const validationError = validateFields(login, email, fullName, password, isUpdate);
        if (validationError) { window.showToast(validationError, 'error'); return; }
        const data = { login, email, full_name: fullName, password: password || null };
        if (isUpdate) data.user_id = currentEditUserId;
        let url = window.API_URLS.USERS, method = 'POST';
        if (isUpdate) {
            url += `/${currentEditUserId}`;
            method = 'PUT';
        }
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!resp.ok) {
                const error = await resp.json();
                let msg = 'Ошибка сохранения';
                if (error.message) msg = error.message;
                else if (error.errors) msg = Object.values(error.errors).flat().join('; ');
                window.showToast(msg, 'error');
                return;
            }
            clearForm();
            await loadTable();
            window.showToast(`Пользователь «${fullName}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
        } catch (err) { window.showToast('Ошибка соединения', 'error'); }
    }

    async function deleteItem(id, name) {
        const confirmed = await window.showConfirmModal({
            title: 'Удаление пользователя',
            message: `Удалить пользователя «${name}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const resp = await fetch(`${window.API_URLS.USERS}/${id}`, { method: 'DELETE' });
            if (!resp.ok) {
                const error = await resp.json();
                window.showToast(error.message || 'Невозможно удалить пользователя', 'error');
                return;
            }
            clearForm();
            await loadTable();
            window.showToast(`Пользователь «${name}» удалён`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
    }

    function initLiveValidation() {
        const fields = [
            { id: 'user-login', required: true, validator: (v) => window.validateLogin(v) },
            { id: 'user-email', required: true, validator: (v) => window.validateEmail(v) },
            { id: 'user-full-name', required: true, validator: (v) => window.validateFullName(v) },
            { id: 'user-password', required: false, validator: (v) => window.validatePassword(v, false) }
        ];
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el && typeof window.attachLiveValidation === 'function') window.attachLiveValidation(el, f.validator, f.required);
        });
    }

    return { loadTable, fillForm, clearForm, save, deleteItem, initLiveValidation };
})();