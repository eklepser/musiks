// js/utils/helpers.js
window.ensureArray = function (data) {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    }
    if (data === null || data === undefined) return [];
    return [data];
};

window.formatDateTimeLocal = function (dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
};

window.getManufacturerName = function (id, manufacturers) {
    if (!manufacturers || !Array.isArray(manufacturers)) return '';
    const m = manufacturers.find(m => m.manufacturer_id === id);
    return m ? m.name : '';
};

window.getSelectedGenres = function (selectId = 'genre-select') {
    const select = document.getElementById(selectId);
    if (!select || !select.value) return [];
    const genreId = parseInt(select.value);
    if (isNaN(genreId)) return [];
    return [genreId];
};

window.renderSelectedList = function (containerId, selectedIds, items, getName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!selectedIds || selectedIds.length === 0) {
        container.innerHTML = '<span class="placeholder-text">Не выбрано</span>';
        return;
    }
    const names = selectedIds.map(id => {
        const item = items.find(i => i.id === id);
        return item ? item.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
};

window.filterNumericInput = function (event) {
    let value = event.target.value;
    let cursorPos = event.target.selectionStart;
    let filtered = value.replace(/[^\d.,]/g, '');
    if (filtered !== value) {
        event.target.value = filtered;
        event.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    return filtered;
};

window.filterLettersOnly = function (event) {
    let value = event.target.value;
    let cursorPos = event.target.selectionStart;
    let filtered = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    if (filtered !== value) {
        event.target.value = filtered;
        event.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
    return filtered;
};

window.setFieldValidity = function (element, isValid, errorMessage) {
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
};

window.clearFieldValidity = function (element) {
    if (!element) return;
    element.classList.remove('is-valid', 'is-invalid');
    element.setCustomValidity('');
};

window.attachLiveValidation = function (element, validator, required = false) {
    if (!element) return;
    const validate = () => {
        const value = element.type === 'checkbox' ? element.checked : element.value;
        if (!required && (!value || value.toString().trim() === '')) {
            window.clearFieldValidity(element);
            return;
        }
        const error = validator(value);
        window.setFieldValidity(element, !error, error);
    };
    element.removeEventListener('input', validate);
    element.removeEventListener('change', validate);
    element.removeEventListener('blur', validate);
    element.addEventListener('input', validate);
    element.addEventListener('change', validate);
    element.addEventListener('blur', validate);
};

window.initNumericInputs = function () {
    document.querySelectorAll('[data-numeric="true"]').forEach(input => {
        input.removeEventListener('input', window.filterNumericInput);
        input.addEventListener('input', window.filterNumericInput);
        input.addEventListener('keypress', (e) => {
            if (!/[\d.,]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    });
};

window.initLettersOnlyInputs = function () {
    document.querySelectorAll('[data-letters-only="true"]').forEach(input => {
        input.removeEventListener('input', window.filterLettersOnly);
        input.addEventListener('input', window.filterLettersOnly);
    });
};

window.initToggleFilters = function () {
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
            if (container) card.insertBefore(header, container);
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
};

window.initToggleAddSections = function () {
    document.querySelectorAll('.add-section-card').forEach(card => {
        let header = card.querySelector('.add-section-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'add-section-header';
            const title = document.createElement('h3');
            const originalTitle = card.querySelector('h3');
            if (originalTitle) {
                title.textContent = originalTitle.textContent;
                originalTitle.style.display = 'none';
            } else {
                title.textContent = 'Добавление';
            }
            const icon = document.createElement('button');
            icon.className = 'toggle-add-icon';
            icon.innerHTML = '▼';
            icon.title = 'Скрыть форму';
            header.appendChild(title);
            header.appendChild(icon);
            const container = card.querySelector('.add-section-container');
            if (container) {
                card.insertBefore(header, container);
            } else {
                const formContainer = document.createElement('div');
                formContainer.className = 'add-section-container';
                while (card.children.length > 0) formContainer.appendChild(card.children[0]);
                card.appendChild(header);
                card.appendChild(formContainer);
            }
        }
        const icon = header.querySelector('.toggle-add-icon');
        const container = card.querySelector('.add-section-container');
        if (icon && container) {
            icon.removeEventListener('click', icon._handler);
            const isHidden = container.classList.contains('hidden');
            icon.innerHTML = isHidden ? '▲' : '▼';
            icon.title = isHidden ? 'Показать форму' : 'Скрыть форму';
            const handler = function (e) {
                e.preventDefault();
                e.stopPropagation();
                container.classList.toggle('hidden');
                const nowHidden = container.classList.contains('hidden');
                icon.innerHTML = nowHidden ? '▲' : '▼';
                icon.title = nowHidden ? 'Показать форму' : 'Скрыть форму';
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
                    icon.title = nowHidden ? 'Показать форму' : 'Скрыть форму';
                }
            };
            header.addEventListener('click', header._clickHandler);
        }
    });
};

window.openAddSection = function (containerSelector) {
    const addSection = document.querySelector(containerSelector);
    if (!addSection) return;
    const container = addSection.querySelector('.add-section-container');
    if (!container) return;
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        const icon = addSection.querySelector('.toggle-add-icon');
        if (icon) {
            icon.innerHTML = '▼';
            icon.title = 'Скрыть форму';
        }
    }
};

window.initCountrySelect = function () {
    const countrySelect = document.getElementById('artist-country');
    if (countrySelect) {
        countrySelect.innerHTML = '<option value="">Не указано</option>';
        window.APP_CONSTANTS.POPULAR_COUNTRIES.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }
    const manufacturerCountrySelect = document.getElementById('manufacturer-country');
    if (manufacturerCountrySelect) {
        manufacturerCountrySelect.innerHTML = '<option value="">Не указано</option>';
        window.APP_CONSTANTS.POPULAR_COUNTRIES.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            manufacturerCountrySelect.appendChild(option);
        });
    }
};

window.initLanguageSelect = function () {
    const languageSelect = document.getElementById('artist-language');
    if (languageSelect) {
        languageSelect.innerHTML = '<option value="">Не указано</option>';
        window.APP_CONSTANTS.POPULAR_LANGUAGES.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageSelect.appendChild(option);
        });
        languageSelect.value = 'Instrumental';
    }
};

window.updateArtistFilterCountries = function (availableCountries) {
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
};

window.updateArtistFilterLanguages = function (availableLanguages) {
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
};

window.loadManufacturersForSelect = async function (selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const resp = await fetch(window.API_URLS.MANUFACTURERS);
        if (resp.ok) {
            window.manufacturers = await resp.json();
            select.innerHTML = '<option value="">Все производители</option>';
            window.manufacturers.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.manufacturer_id;
                opt.textContent = m.name;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Ошибка загрузки производителей', err);
    }
};

window.loadConcertsSelect = async function (selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const resp = await fetch(window.API_URLS.CONCERTS);
        if (resp.ok) {
            const concerts = await resp.json();
            select.innerHTML = '<option value="">Выберите концерт</option>';
            concerts.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.concert_id;
                opt.textContent = `${c.title} (ID ${c.concert_id})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Ошибка загрузки концертов', err);
    }
};

window.loadGenresAndLinks = async function () {
    try {
        const [genresRes, linksRes] = await Promise.all([
            fetch(window.API_URLS.GENRES),
            fetch(window.API_URLS.PRODUCT_GENRES)
        ]);
        if (genresRes.ok) window.genres = await genresRes.json();
        if (linksRes.ok) {
            const links = await linksRes.json();
            window.productGenres = {};
            links.forEach(link => {
                if (!window.productGenres[link.product_id]) window.productGenres[link.product_id] = [];
                window.productGenres[link.product_id].push(link.genre_id);
            });
        }
        const container = document.getElementById('genre-select');
        if (container) {
            container.innerHTML = '<option value="">Все жанры</option>';
            const sortedGenres = [...window.genres].sort((a, b) => a.name.localeCompare(b.name));
            sortedGenres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.genre_id;
                option.textContent = genre.name;
                container.appendChild(option);
            });
        }
    } catch (err) { console.error(err); }
};

window.loadManufacturerNameDatalist = async function () {
    const datalist = document.getElementById('manufacturer-name-datalist');
    if (!datalist) return;
    try {
        const resp = await fetch(`${window.API_URLS.MANUFACTURERS}/filter/names`);
        if (resp.ok) {
            const names = await resp.json();
            datalist.innerHTML = '';
            names.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
        }
    } catch (err) { console.error(err); }
};

window.loadManufacturerCountryDatalist = async function () {
    const datalist = document.getElementById('manufacturer-country-datalist');
    if (!datalist) return;
    try {
        const resp = await fetch(`${window.API_URLS.MANUFACTURERS}/filter/countries`);
        if (resp.ok) {
            const countries = await resp.json();
            datalist.innerHTML = '';
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                datalist.appendChild(option);
            });
        }
    } catch (err) { console.error(err); }
};

window.loadGenreNameDatalist = async function () {
    const datalist = document.getElementById('genre-name-datalist');
    if (!datalist) return;
    try {
        const resp = await fetch(`${window.API_URLS.GENRES}/filter/names`);
        if (resp.ok) {
            const names = await resp.json();
            datalist.innerHTML = '';
            names.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
        }
    } catch (err) { console.error(err); }
};

window.parseErrorMessage = async function (resp) {
    try {
        const contentType = resp.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const error = await resp.json();
            if (error.message) return error.message;
            if (error.title && error.detail) return error.detail;
            if (error.errors) {
                const messages = Object.values(error.errors).flat();
                return messages.join('; ');
            }
            return 'Произошла ошибка';
        } else {
            const text = await resp.text();
            return text || 'Произошла ошибка';
        }
    } catch (e) {
        return 'Произошла ошибка';
    }
};