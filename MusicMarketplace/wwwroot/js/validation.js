function validateRequiredString(value, fieldName, minLength = 2, maxLength = 200, required = true) {
    if (!required && (!value || typeof value !== 'string' || value.trim() === '')) {
        return null;
    }
    if (required && (!value || typeof value !== 'string' || value.trim() === '')) {
        return `${fieldName} обязательно для заполнения`;
    }
    if (value && typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed)) {
            return `${fieldName} не может быть числом`;
        }
        if (trimmed.length < minLength) {
            return `${fieldName} должен содержать не менее ${minLength} символов`;
        }
        if (trimmed.length > maxLength) {
            return `${fieldName} не должен превышать ${maxLength} символов`;
        }
    }
    return null;
}
function validateOptionalString(value, fieldName, maxLength = 200) {
    if (value && typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed && /^\d+$/.test(trimmed)) {
            return `${fieldName} не может быть числом`;
        }
        if (trimmed.length > maxLength) {
            return `${fieldName} не должен превышать ${maxLength} символов`;
        }
    }
    return null;
}
function validatePositiveInteger(value, fieldName) {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        return `${fieldName} должен быть целым положительным числом`;
    }
    return null;
}
function validateNonNegativeInteger(value, fieldName) {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return `${fieldName} должен быть целым неотрицательным числом`;
    }
    return null;
}
function validatePositiveNumber(value, fieldName) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} должен быть положительным числом`;
    }
    if (value.toString().includes('.') && value.toString().split('.')[1]?.length > 2) {
        return `${fieldName} не может содержать более двух знаков после запятой`;
    }
    return null;
}
function validatePrice(value) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        return 'Цена должна быть числом';
    }
    if (num < 0) {
        return 'Цена не может быть отрицательной';
    }
    if (num > 1000000) {
        return 'Цена не может превышать 1 000 000';
    }
    if (value.toString().includes('.') && value.toString().split('.')[1]?.length > 2) {
        return 'Цена не может содержать более двух знаков после запятой';
    }
    return null;
}
function validateStock(value) {
    const str = String(value).trim();
    if (str === '') {
        return 'Укажите остаток';
    }
    const num = Number(str);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return 'Остаток должен быть целым неотрицательным числом';
    }
    return null;
}
function validateYear(value, fieldName) {
    if (!value) return null;
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || !Number.isInteger(year) || year < 1900 || year > currentYear) {
        return `${fieldName} должен быть целым числом от 1900 до ${currentYear}`;
    }
    return null;
}
function validateContactInfo(value) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return 'Контактные данные обязательны';
    }
    const trimmed = value.trim();
    const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    const phonePattern = /^[\d\s\-+()]+$/;
    const urlPattern = /^https?:\/\//i;
    if (!emailPattern.test(trimmed) && !phonePattern.test(trimmed) && !urlPattern.test(trimmed)) {
        return 'Введите корректный email (user@example.com), телефон (только цифры, пробелы, +, -, (, )) или URL (начинающийся с http:// или https://)';
    }
    return null;
}
function validateConcertDatetime(datetimeLocal) {
    if (!datetimeLocal) return 'Дата и время обязательны';
    const date = new Date(datetimeLocal);
    if (isNaN(date.getTime())) return 'Некорректная дата и время';
    return null;
}