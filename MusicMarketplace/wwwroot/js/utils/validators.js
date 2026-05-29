window.validateRequiredString = function (value, fieldName, minLength = 2, maxLength = 200, required = true) {
    if (!required && (!value || typeof value !== 'string' || value.trim() === '')) return null;
    if (required && (!value || typeof value !== 'string' || value.trim() === '')) return `${fieldName} обязательно для заполнения`;
    if (value && typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed) && fieldName !== "Цена" && fieldName !== "Год") return `${fieldName} не может быть только числом`;
        if (trimmed.length < minLength) return `${fieldName} должен содержать не менее ${minLength} символов`;
        if (trimmed.length > maxLength) return `${fieldName} не должен превышать ${maxLength} символов`;
    }
    return null;
};

window.validateOptionalString = function (value, fieldName, maxLength = 200, minLength = 0) {
    if (!value || typeof value !== 'string' || value.trim() === '') return null;
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) return `${fieldName} не может быть только числом`;
    if (trimmed.length < minLength) return `${fieldName} должен содержать не менее ${minLength} символов`;
    if (trimmed.length > maxLength) return `${fieldName} не должен превышать ${maxLength} символов`;
    return null;
};

window.validateNoLeadingDigit = function (value, fieldName, required = false, minLength = 0, maxLength = 200) {
    if (!required && (!value || value.trim() === '')) return null;
    if (required && (!value || value.trim() === '')) return `${fieldName} обязательно`;
    const trimmed = value.trim();
    if (/^\d/.test(trimmed)) return `${fieldName} не может начинаться с цифры`;
    if (trimmed.length < minLength) return `${fieldName} должен содержать не менее ${minLength} символов`;
    if (trimmed.length > maxLength) return `${fieldName} не должен превышать ${maxLength} символов`;
    return null;
};

window.validateAlphabeticWithSpaces = function (value, fieldName, minLength = 3, maxLength = 30, required = false) {
    if (!required && (!value || value.trim() === '')) return null;
    if (required && (!value || value.trim() === '')) return `${fieldName} обязательно`;
    const trimmed = value.trim();
    if (!/^[A-Za-zА-Яа-яЁё\s\-]+$/.test(trimmed)) return `${fieldName} может содержать только буквы, пробелы и дефисы`;
    if (trimmed.length < minLength) return `${fieldName} должен содержать не менее ${minLength} символов`;
    if (trimmed.length > maxLength) return `${fieldName} не должен превышать ${maxLength} символов`;
    return null;
};

window.validatePositiveInteger = function (value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    if (required && (!value || value.toString().trim() === '')) return `${fieldName} обязателен для заполнения`;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) return `${fieldName} должен быть целым положительным числом`;
    return null;
};

window.validateNonNegativeInteger = function (value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    if (required && (!value || value.toString().trim() === '')) return `${fieldName} обязателен для заполнения`;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) return `${fieldName} должен быть целым неотрицательным числом`;
    return null;
};

window.validatePositiveNumber = function (value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    if (required && (!value || value.toString().trim() === '')) return `${fieldName} обязателен для заполнения`;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return `${fieldName} должен быть положительным числом`;
    if (value.toString().includes('.') && value.toString().split('.')[1]?.length > 2) return `${fieldName} не может содержать более двух знаков после запятой`;
    return null;
};

window.validatePrice = function (value, required = true) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    if (required && (!value || value.toString().trim() === '')) return 'Цена обязательна для заполнения';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Цена должна быть числом';
    if (num < 0) return 'Цена не может быть отрицательной';
    if (num > 1000000) return 'Цена не может превышать 1 000 000';
    if (value.toString().includes('.') && value.toString().split('.')[1]?.length > 2) return 'Цена не может содержать более двух знаков после запятой';
    return null;
};

window.validateStock = function (value, required = false) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) return 'Остаток должен быть целым неотрицательным числом';
    if (num > 1000000) return 'Остаток не может превышать 1 000 000';
    return null;
};

window.validateYear = function (value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) return null;
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || !Number.isInteger(year) || year < 1900 || year > currentYear) return `${fieldName} должен быть целым числом от 1900 до ${currentYear}`;
    return null;
};

window.validateContactInfo = function (value) {
    if (!value || typeof value !== 'string' || value.trim() === '') return 'Контактные данные обязательны';
    const trimmed = value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[\d\s\-+()]{7,}$/;
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!emailPattern.test(trimmed) && !phonePattern.test(trimmed) && !urlPattern.test(trimmed)) return 'Введите корректный email, телефон (минимум 7 цифр) или URL';
    if (trimmed.length < 5) return 'Контактные данные слишком короткие';
    return null;
};

window.validateConcertDatetime = function (datetimeLocal) {
    if (!datetimeLocal) return 'Дата и время обязательны';
    const date = new Date(datetimeLocal);
    if (isNaN(date.getTime())) return 'Некорректная дата и время';
    return null;
};

window.validateLogin = function (login) {
    if (!login || login.trim() === '') return 'Логин обязателен';
    if (login.length < 3 || login.length > 50) return 'Логин должен содержать от 3 до 50 символов';
    if (/^\d+$/.test(login.trim())) return 'Логин не может состоять только из цифр';
    if (!/^[a-zA-Z0-9_-]+$/.test(login.trim())) return 'Логин может содержать только буквы, цифры, дефис и подчеркивание';
    return null;
};

window.validateFullName = function (fullName) {
    if (!fullName || fullName.trim() === '') return 'ФИО обязательно';
    if (fullName.length < 2 || fullName.length > 100) return 'ФИО должно содержать от 2 до 100 символов';
    if (/^\d+$/.test(fullName.trim())) return 'ФИО не может состоять только из цифр';
    if (fullName.trim().split(/\s+/).length < 2) return 'ФИО должно содержать минимум два слова';
    return null;
};

window.validateEmail = function (email) {
    if (!email || email.trim() === '') return 'Email обязателен';
    if (email.length < 5 || email.length > 100) return 'Email должен содержать от 5 до 100 символов';
    const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailPattern.test(email.trim())) return 'Введите корректный email адрес';
    return null;
};

window.validatePassword = function (password, isRequired = true) {
    if (!isRequired && (!password || password.trim() === '')) return null;
    if (!password || password.trim() === '') return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (password.length > 50) return 'Пароль не должен превышать 50 символов';
    return null;
};