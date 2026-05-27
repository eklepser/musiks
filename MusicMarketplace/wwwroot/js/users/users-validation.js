function validateLogin(login) {
    const err = validateRequiredString(login, 'Логин', 3, 50, true);
    if (err) return err;
    if (/^\d+$/.test(login.trim())) return 'Логин не может состоять только из цифр';
    if (!/^[a-zA-Z0-9_-]+$/.test(login.trim())) return 'Логин может содержать только буквы, цифры, дефис и подчеркивание';
    return null;
}

function validateFullName(fullName) {
    const err = validateRequiredString(fullName, 'ФИО', 2, 100, true);
    if (err) return err;
    if (/^\d+$/.test(fullName.trim())) return 'ФИО не может состоять только из цифр';
    if (fullName.trim().split(/\s+/).length < 2) return 'ФИО должно содержать минимум два слова';
    return null;
}

function validateEmail(email) {
    const err = validateRequiredString(email, 'Email', 5, 100, true);
    if (err) return err;
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

window.validateUserForm = function (isEdit = false) {
    const login = document.getElementById('user-login').value.trim();
    const fullName = document.getElementById('user-full-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;

    let err = validateLogin(login);
    if (err) return err;

    err = validateFullName(fullName);
    if (err) return err;

    err = validateEmail(email);
    if (err) return err;

    err = validatePassword(password, !isEdit);
    if (err) return err;

    return null;
};