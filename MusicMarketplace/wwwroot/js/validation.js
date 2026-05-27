function validateRequiredString(value, fieldName, minLength = 2, maxLength = 200, required = true) {
    if (!required && (!value || typeof value !== 'string' || value.trim() === '')) {
        return null;
    }
    if (required && (!value || typeof value !== 'string' || value.trim() === '')) {
        return `${fieldName} обязательно для заполнения`;
    }
    if (value && typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed) && fieldName !== "Цена" && fieldName !== "Год") {
            return `${fieldName} не может быть только числом`;
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
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return null;
    }
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
        return `${fieldName} не может быть числом`;
    }
    if (trimmed.length > maxLength) {
        return `${fieldName} не должен превышать ${maxLength} символов`;
    }
    return null;
}

function validatePositiveInteger(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return null;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        return `${fieldName} должен быть целым положительным числом`;
    }
    return null;
}

function validateNonNegativeInteger(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return null;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return `${fieldName} должен быть целым неотрицательным числом`;
    }
    return null;
}

function validatePositiveNumber(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return null;
    }
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
    if (!value || value.toString().trim() === '') {
        return 'Цена обязательна для заполнения';
    }
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
    if (!value || value.toString().trim() === '') {
        return null;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return 'Остаток должен быть целым неотрицательным числом';
    }
    if (num > 1000000) {
        return 'Остаток не может превышать 1 000 000';
    }
    return null;
}

function validateYear(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return null;
    }
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
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[\d\s\-+()]{7,}$/;
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!emailPattern.test(trimmed) && !phonePattern.test(trimmed) && !urlPattern.test(trimmed)) {
        return 'Введите корректный email, телефон (минимум 7 цифр) или URL';
    }
    if (trimmed.length < 5) {
        return 'Контактные данные слишком короткие';
    }
    return null;
}

function validateConcertDatetime(datetimeLocal) {
    if (!datetimeLocal) return 'Дата и время обязательны';
    const date = new Date(datetimeLocal);
    if (isNaN(date.getTime())) return 'Некорректная дата и время';
    return null;
}

function filterNumericInput(event) {
    let value = event.target.value;
    let cursorPos = event.target.selectionStart;
    let filtered = value.replace(/[^\d.,]/g, '');
    if (filtered !== value) {
        event.target.value = filtered;
        event.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    return filtered;
}

function filterLettersOnly(event) {
    let value = event.target.value;
    let cursorPos = event.target.selectionStart;
    let filtered = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    if (filtered !== value) {
        event.target.value = filtered;
        event.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    return filtered;
}

function validateOnlyLetters(value, fieldName, minLength = 2, maxLength = 100) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return `${fieldName} обязательно для заполнения`;
    }
    const trimmed = value.trim();
    const lettersPattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!lettersPattern.test(trimmed)) {
        return `${fieldName} может содержать только буквы, пробелы и дефисы`;
    }
    if (trimmed.length < minLength) {
        return `${fieldName} должен содержать не менее ${minLength} символов`;
    }
    if (trimmed.length > maxLength) {
        return `${fieldName} не должен превышать ${maxLength} символов`;
    }
    return null;
}

function setFieldValidity(element, isValid, errorMessage) {
    if (!element) return;
    if (isValid) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
        element.setCustomValidity('');
    } else {
        element.classList.remove('is-valid');
        element.classList.add('is-invalid');
        element.setCustomValidity(errorMessage || 'Некорректное значение');
    }
}

function initNumericInputs() {
    document.querySelectorAll('[data-numeric="true"]').forEach(input => {
        input.removeEventListener('input', filterNumericInput);
        input.addEventListener('input', filterNumericInput);
        input.addEventListener('keypress', (e) => {
            if (!/[\d.,]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    });
}

function initLettersOnlyInputs() {
    document.querySelectorAll('[data-letters-only="true"]').forEach(input => {
        input.removeEventListener('input', filterLettersOnly);
        input.addEventListener('input', filterLettersOnly);
    });
}

function initToggleFilters() {
    document.querySelectorAll('.filters-card').forEach(card => {
        let header = card.querySelector('.filters-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'filters-header';
            const title = document.createElement('h3');
            title.textContent = 'Фильтры';
            const icon = document.createElement('button');
            icon.className = 'toggle-filters-icon';
            icon.innerHTML = '▼';
            icon.title = 'Скрыть фильтры';
            header.appendChild(title);
            header.appendChild(icon);
            const container = card.querySelector('.filter-group-container');
            if (container) {
                card.insertBefore(header, container);
            }
        }
        const icon = header.querySelector('.toggle-filters-icon');
        const container = card.querySelector('.filter-group-container');
        if (icon && container) {
            icon.removeEventListener('click', icon._handler);
            const isHidden = container.classList.contains('hidden');
            icon.innerHTML = isHidden ? '▲' : '▼';
            icon.title = isHidden ? 'Показать фильтры' : 'Скрыть фильтры';
            const handler = function (e) {
                e.preventDefault();
                e.stopPropagation();
                container.classList.toggle('hidden');
                const nowHidden = container.classList.contains('hidden');
                icon.innerHTML = nowHidden ? '▲' : '▼';
                icon.title = nowHidden ? 'Показать фильтры' : 'Скрыть фильтры';
            };
            icon._handler = handler;
            icon.addEventListener('click', handler);
            header.style.cursor = 'pointer';
            header.removeEventListener('click', header._clickHandler);
            header._clickHandler = function (e) {
                if (e.target !== icon) {
                    container.classList.toggle('hidden');
                    const nowHidden = container.classList.contains('hidden');
                    icon.innerHTML = nowHidden ? '▲' : '▼';
                    icon.title = nowHidden ? 'Показать фильтры' : 'Скрыть фильтры';
                }
            };
            header.addEventListener('click', header._clickHandler);
        }
    });
}

function initAllValidations() {
    initNumericInputs();
    initLettersOnlyInputs();
    initToggleFilters();
}

window.filterNumericInput = filterNumericInput;
window.filterLettersOnly = filterLettersOnly;
window.validateOnlyLetters = validateOnlyLetters;
window.setFieldValidity = setFieldValidity;
window.initToggleFilters = initToggleFilters;
window.initAllValidations = initAllValidations;