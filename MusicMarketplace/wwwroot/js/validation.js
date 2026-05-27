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
        return `${fieldName} не может быть только числом`;
    }
    if (trimmed.length > maxLength) {
        return `${fieldName} не должен превышать ${maxLength} символов`;
    }
    return null;
}

function validatePositiveInteger(value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) {
        return null;
    }
    if (required && (!value || value.toString().trim() === '')) {
        return `${fieldName} обязателен для заполнения`;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        return `${fieldName} должен быть целым положительным числом`;
    }
    return null;
}

function validateNonNegativeInteger(value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) {
        return null;
    }
    if (required && (!value || value.toString().trim() === '')) {
        return `${fieldName} обязателен для заполнения`;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return `${fieldName} должен быть целым неотрицательным числом`;
    }
    return null;
}

function validatePositiveNumber(value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) {
        return null;
    }
    if (required && (!value || value.toString().trim() === '')) {
        return `${fieldName} обязателен для заполнения`;
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

function validatePrice(value, required = true) {
    if (!required && (!value || value.toString().trim() === '')) {
        return null;
    }
    if (required && (!value || value.toString().trim() === '')) {
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

function validateStock(value, required = false) {
    if (!required && (!value || value.toString().trim() === '')) {
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

function validateYear(value, fieldName, required = false) {
    if (!required && (!value || value.toString().trim() === '')) {
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

function clearFieldValidity(element) {
    if (!element) return;
    element.classList.remove('is-valid', 'is-invalid');
    element.setCustomValidity('');
}

function attachLiveValidation(element, validator, required = false) {
    if (!element) return;
    const validate = () => {
        const value = element.type === 'checkbox' ? element.checked : element.value;
        if (!required && (!value || value.toString().trim() === '')) {
            clearFieldValidity(element);
            return;
        }
        const error = validator(value);
        setFieldValidity(element, !error, error);
    };
    element.removeEventListener('input', validate);
    element.removeEventListener('change', validate);
    element.removeEventListener('blur', validate);
    element.addEventListener('input', validate);
    element.addEventListener('change', validate);
    element.addEventListener('blur', validate);
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

const POPULAR_COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe"
];

const POPULAR_LANGUAGES = [
    "English", "Russian", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean",
    "Arabic", "Hindi", "Turkish", "Dutch", "Polish", "Swedish", "Norwegian", "Danish", "Finnish", "Greek", "Czech",
    "Hungarian", "Romanian", "Thai", "Vietnamese", "Indonesian", "Hebrew", "Persian", "Ukrainian", "Instrumental"
];

function initCountrySelect() {
    const countrySelect = document.getElementById('artist-country');
    if (countrySelect) {
        countrySelect.innerHTML = '<option value="">Не указано</option>';
        POPULAR_COUNTRIES.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }
    const manufacturerCountrySelect = document.getElementById('manufacturer-country');
    if (manufacturerCountrySelect) {
        manufacturerCountrySelect.innerHTML = '<option value="">Не указано</option>';
        POPULAR_COUNTRIES.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            manufacturerCountrySelect.appendChild(option);
        });
    }
}

function initLanguageSelect() {
    const languageSelect = document.getElementById('artist-language');
    if (languageSelect) {
        languageSelect.innerHTML = '<option value="">Не указано</option>';
        POPULAR_LANGUAGES.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageSelect.appendChild(option);
        });
        languageSelect.value = 'Instrumental';
    }
}

function updateArtistFilterCountries(availableCountries) {
    const select = document.getElementById('artist-search-country');
    if (!select) return;
    select.innerHTML = '<option value="">Все страны</option>';
    const sortedCountries = [...new Set(availableCountries.filter(c => c))].sort();
    sortedCountries.forEach(country => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        select.appendChild(opt);
    });
}

function updateArtistFilterLanguages(availableLanguages) {
    const select = document.getElementById('artist-search-language');
    if (!select) return;
    select.innerHTML = '<option value="">Все языки</option><option value="Instrumental">Инструментальная (без языка)</option>';
    const sortedLanguages = [...new Set(availableLanguages.filter(l => l && l !== 'Instrumental'))].sort();
    sortedLanguages.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        select.appendChild(opt);
    });
}

function showConfirmModal(options) {
    return new Promise((resolve) => {
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content confirm-modal-content">
                    <h3 id="confirm-title">Подтверждение</h3>
                    <p id="confirm-message">Вы уверены?</p>
                    <div class="confirm-buttons">
                        <button id="confirm-yes-btn" class="delete-btn">Да, удалить</button>
                        <button id="confirm-no-btn" class="edit-btn">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const yesBtn = document.getElementById('confirm-yes-btn');
        const noBtn = document.getElementById('confirm-no-btn');
        if (options.title) titleEl.textContent = options.title;
        if (options.message) messageEl.textContent = options.message;
        if (options.yesText) yesBtn.textContent = options.yesText;
        if (options.noText) noBtn.textContent = options.noText;
        modal.style.display = 'block';
        const onYes = () => {
            modal.style.display = 'none';
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            window.removeEventListener('click', outsideClick);
            resolve(true);
        };
        const onNo = () => {
            modal.style.display = 'none';
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            window.removeEventListener('click', outsideClick);
            resolve(false);
        };
        const outsideClick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                yesBtn.removeEventListener('click', onYes);
                noBtn.removeEventListener('click', onNo);
                window.removeEventListener('click', outsideClick);
                resolve(false);
            }
        };
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        window.addEventListener('click', outsideClick);
    });
}

function initAllValidations() {
    initNumericInputs();
    initLettersOnlyInputs();
    initToggleFilters();
    setTimeout(function () {
        if (typeof initCountrySelect === 'function') initCountrySelect();
        if (typeof initLanguageSelect === 'function') initLanguageSelect();
    }, 50);
}

window.filterNumericInput = filterNumericInput;
window.filterLettersOnly = filterLettersOnly;
window.validateOnlyLetters = validateOnlyLetters;
window.setFieldValidity = setFieldValidity;
window.clearFieldValidity = clearFieldValidity;
window.attachLiveValidation = attachLiveValidation;
window.initToggleFilters = initToggleFilters;
window.initAllValidations = initAllValidations;
window.initCountrySelect = initCountrySelect;
window.initLanguageSelect = initLanguageSelect;
window.updateArtistFilterCountries = updateArtistFilterCountries;
window.updateArtistFilterLanguages = updateArtistFilterLanguages;
window.showConfirmModal = showConfirmModal;
window.POPULAR_COUNTRIES = POPULAR_COUNTRIES;
window.POPULAR_LANGUAGES = POPULAR_LANGUAGES;