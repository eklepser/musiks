const ARTISTS_FILTER_URL = 'https://localhost:7062/api/Artists/filter';
const CONCERTS_FILTER_URL = 'https://localhost:7062/api/Concerts/filter';
const CONCERTS_ARTISTS_URL = 'https://localhost:7062/api/Concerts/filter/artists';

let allArtists = [];
let allConcerts = [];
let artistConcertLinks = [];

let currentEditArtistId = null;
let currentEditConcertId = null;
let selectedArtistsForConcert = [];

async function loadArtists() {
    const resp = await fetch('https://localhost:7062/api/Artists');
    if (resp.ok) {
        allArtists = await resp.json();
        updateArtistFilterOptions();
        updateModalArtistSelect();
        updateOpenArtistsButtonVisibility();
        if (typeof updateArtistFilterCountries === 'function') {
            const countries = allArtists.map(a => a.country);
            updateArtistFilterCountries(countries);
            const languages = allArtists.map(a => a.language);
            updateArtistFilterLanguages(languages);
        }
    }
}

async function loadConcerts() {
    const resp = await fetch('https://localhost:7062/api/Concerts');
    if (resp.ok) {
        allConcerts = await resp.json();
        updateConcertFilterOptions();
    }
}

async function loadArtistConcerts() {
    const resp = await fetch('https://localhost:7062/api/ArtistConcerts');
    if (resp.ok) {
        artistConcertLinks = await resp.json();
    }
}

function updateModalArtistSelect() {
    const select = document.getElementById('modal-artist-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
    allArtists.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        select.appendChild(opt);
    });
}

function updateOpenArtistsButtonVisibility() {
    const btn = document.getElementById('open-artists-modal-btn');
    if (btn) {
        btn.style.display = allArtists.length === 0 ? 'none' : 'inline-block';
    }
}

function updateArtistFilterOptions() {
    const countries = [...new Set(allArtists.map(a => a.country).filter(c => c))].sort();
    const languages = [...new Set(allArtists.map(a => a.language).filter(l => l && l !== 'Instrumental'))].sort();
    const names = allArtists.map(a => a.name);

    const countrySelect = document.getElementById('artist-search-country');
    const languageSelect = document.getElementById('artist-search-language');
    const nameDatalist = document.getElementById('artist-name-datalist');

    if (countrySelect) {
        countrySelect.innerHTML = '<option value="">Все страны</option>';
        countries.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            countrySelect.appendChild(opt);
        });
    }

    if (languageSelect) {
        languageSelect.innerHTML = '<option value="">Все языки</option><option value="Instrumental">Инструментальная (без языка)</option>';
        languages.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang;
            opt.textContent = lang;
            languageSelect.appendChild(opt);
        });
    }

    if (nameDatalist) {
        nameDatalist.innerHTML = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            nameDatalist.appendChild(opt);
        });
    }
}

function updateConcertFilterOptions() {
    const venues = [...new Set(allConcerts.map(c => c.venue).filter(v => v))].sort();
    const titles = allConcerts.map(c => c.title);
    const venueSelect = document.getElementById('concert-search-venue');
    const titleDatalist = document.getElementById('concert-title-datalist');
    const venueDatalist = document.getElementById('concert-venue-datalist');

    if (venueSelect) {
        venueSelect.innerHTML = '<option value="">Все места</option>';
        venues.forEach(venue => {
            const opt = document.createElement('option');
            opt.value = venue;
            opt.textContent = venue;
            venueSelect.appendChild(opt);
        });
    }

    if (venueDatalist) {
        venueDatalist.innerHTML = '';
        venues.forEach(venue => {
            const opt = document.createElement('option');
            opt.value = venue;
            venueDatalist.appendChild(opt);
        });
    }

    if (titleDatalist) {
        titleDatalist.innerHTML = '';
        titles.forEach(title => {
            const opt = document.createElement('option');
            opt.value = title;
            titleDatalist.appendChild(opt);
        });
    }
}

function renderSelectedArtistsList() {
    const container = document.getElementById('selected-artists-list');
    if (!container) return;
    if (selectedArtistsForConcert.length === 0) {
        container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
        return;
    }
    const names = selectedArtistsForConcert.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

async function renderArtists() {
    const searchName = document.getElementById('artist-search-name')?.value.trim() || '';
    const searchCountry = document.getElementById('artist-search-country')?.value || '';
    const searchLanguage = document.getElementById('artist-search-language')?.value || '';
    const sortBy = document.getElementById('artist-sort')?.value || 'name_asc';

    let url = `${ARTISTS_FILTER_URL}?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (searchCountry) url += `searchCountry=${encodeURIComponent(searchCountry)}&`;
    if (searchLanguage) url += `searchLanguage=${encodeURIComponent(searchLanguage)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const artists = await resp.json();
        const tbody = document.getElementById('artists-tbody');
        const countSpan = document.getElementById('artist-found-count');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (artists.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Нет данных</tbody>';
            if (countSpan) countSpan.innerText = '0';
            return;
        }
        if (countSpan) countSpan.innerText = artists.length;
        artists.forEach(artist => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = artist.artist_id;
            row.insertCell(1).textContent = artist.name;
            row.insertCell(2).textContent = artist.country || '';
            row.insertCell(3).textContent = artist.debut_year || '';
            row.insertCell(4).textContent = artist.language || '';
            const actions = row.insertCell(5);
            const btnRow = document.createElement('div');
            btnRow.className = 'action-buttons-row';
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillArtistForm(artist);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteArtist(artist.artist_id, artist.name);
            btnRow.append(editBtn, delBtn);
            actions.appendChild(btnRow);
        });
    } catch (err) {
        const tbody = document.getElementById('artists-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Ошибка загрузки</tbody>';
    }
}

async function renderConcerts() {
    const searchTitle = document.getElementById('concert-search-title')?.value.trim() || '';
    const searchVenue = document.getElementById('concert-search-venue')?.value || '';
    const searchStatus = document.getElementById('concert-search-status')?.value || '';
    const searchArtist = document.getElementById('concert-search-artist')?.value || '';
    const sortBy = document.getElementById('concert-sort')?.value || 'date_asc';

    let url = `${CONCERTS_FILTER_URL}?`;
    if (searchTitle) url += `searchTitle=${encodeURIComponent(searchTitle)}&`;
    if (searchVenue) url += `searchVenue=${encodeURIComponent(searchVenue)}&`;
    if (searchStatus) url += `status=${searchStatus}&`;
    if (searchArtist) url += `artistId=${searchArtist}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const concerts = await resp.json();
        const tbody = document.getElementById('concerts-tbody');
        const countSpan = document.getElementById('concert-found-count');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (concerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Нет данных</tbody>';
            if (countSpan) countSpan.innerText = '0';
            return;
        }
        if (countSpan) countSpan.innerText = concerts.length;
        for (const concert of concerts) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = concert.concert_id;
            row.insertCell(1).textContent = concert.title;
            row.insertCell(2).textContent = concert.venue;
            row.insertCell(3).textContent = new Date(concert.datetime).toLocaleString();
            row.insertCell(4).textContent = concert.artistNames || '—';
            const actions = row.insertCell(5);
            const btnRow = document.createElement('div');
            btnRow.className = 'action-buttons-row';
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillConcertForm(concert);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteConcert(concert.concert_id, concert.title);
            btnRow.append(editBtn, delBtn);
            actions.appendChild(btnRow);
        }
    } catch (err) {
        const tbody = document.getElementById('concerts-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Ошибка загрузки</tbody>';
    }
}

async function loadArtistOptions() {
    const resp = await fetch(CONCERTS_ARTISTS_URL);
    if (resp.ok) {
        const artists = await resp.json();
        const select = document.getElementById('concert-search-artist');
        if (select) {
            select.innerHTML = '<option value="">Все исполнители</option>';
            artists.forEach(artist => {
                const opt = document.createElement('option');
                opt.value = artist.artist_id;
                opt.textContent = artist.name;
                select.appendChild(opt);
            });
        }
    }
}

function initArtistLiveValidation() {
    const fields = [
        { id: 'artist-name', required: true, validator: (v) => validateRequiredString(v, 'Имя', 2, 100, true) },
        { id: 'artist-country', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Страна', 50) : null },
        { id: 'artist-debut-year', required: false, validator: (v) => v && v.trim() ? validateYear(v, 'Год дебюта') : null },
        { id: 'artist-language', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Язык', 50) : null }
    ];
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && typeof attachLiveValidation === 'function') {
            attachLiveValidation(el, f.validator, f.required);
        }
    });
}

function initConcertLiveValidation() {
    const fields = [
        { id: 'concert-title', required: true, validator: (v) => validateRequiredString(v, 'Название', 2, 150, true) },
        { id: 'concert-venue', required: true, validator: (v) => validateRequiredString(v, 'Место', 2, 100, true) },
        { id: 'concert-datetime', required: true, validator: (v) => v ? validateConcertDatetime(v) : 'Дата и время обязательны' }
    ];
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && typeof attachLiveValidation === 'function') {
            attachLiveValidation(el, f.validator, f.required);
        }
    });
}

function fillArtistForm(artist) {
    if (typeof openAddSection === 'function') {
        openAddSection('#artists-tab .add-section-card');
    }
    const countrySelect = document.getElementById('artist-country');
    const languageSelect = document.getElementById('artist-language');
    const nameInput = document.getElementById('artist-name');
    const debutInput = document.getElementById('artist-debut-year');
    const editIdInput = document.getElementById('artist-edit-id');
    const submitBtn = document.getElementById('artist-submit');
    const cancelBtn = document.getElementById('artist-cancel');

    if (nameInput) nameInput.value = artist.name;
    if (countrySelect) countrySelect.value = artist.country || '';
    if (debutInput) debutInput.value = artist.debut_year || '';
    if (languageSelect) languageSelect.value = artist.language || '';
    if (editIdInput) editIdInput.value = artist.artist_id;
    currentEditArtistId = artist.artist_id;
    if (submitBtn) submitBtn.innerText = 'Сохранить';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    const fields = ['artist-name', 'artist-country', 'artist-debut-year', 'artist-language'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });

    setTimeout(() => {
        if (nameInput && typeof validateRequiredString === 'function') {
            const error = validateRequiredString(nameInput.value, 'Имя', 2, 100, true);
            if (typeof setFieldValidity === 'function') setFieldValidity(nameInput, !error, error);
        }
        if (countrySelect && countrySelect.value.trim() && typeof validateOptionalString === 'function') {
            const error = validateOptionalString(countrySelect.value, 'Страна', 50);
            if (typeof setFieldValidity === 'function') setFieldValidity(countrySelect, !error, error);
        }
        if (debutInput && debutInput.value.trim() && typeof validateYear === 'function') {
            const error = validateYear(debutInput.value, 'Год дебюта');
            if (typeof setFieldValidity === 'function') setFieldValidity(debutInput, !error, error);
        }
        if (languageSelect && languageSelect.value.trim() && typeof validateOptionalString === 'function') {
            const error = validateOptionalString(languageSelect.value, 'Язык', 50);
            if (typeof setFieldValidity === 'function') setFieldValidity(languageSelect, !error, error);
        }
    }, 10);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearArtistForm() {
    const nameInput = document.getElementById('artist-name');
    const countrySelect = document.getElementById('artist-country');
    const debutInput = document.getElementById('artist-debut-year');
    const languageSelect = document.getElementById('artist-language');
    const editIdInput = document.getElementById('artist-edit-id');
    const submitBtn = document.getElementById('artist-submit');
    const cancelBtn = document.getElementById('artist-cancel');

    if (nameInput) nameInput.value = '';
    if (countrySelect) countrySelect.value = '';
    if (debutInput) debutInput.value = '';
    if (languageSelect) languageSelect.value = '';
    if (editIdInput) editIdInput.value = '';
    currentEditArtistId = null;
    if (submitBtn) submitBtn.innerText = 'Добавить';
    if (cancelBtn) cancelBtn.style.display = 'none';

    const fields = ['artist-name', 'artist-country', 'artist-debut-year', 'artist-language'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });
}

function validateArtistFields(name, country, debutYear, language) {
    let err = validateRequiredString(name, 'Имя', 2, 100, true);
    if (err) return err;
    if (country && country.trim()) {
        err = validateOptionalString(country, 'Страна', 50);
        if (err) return err;
    }
    if (debutYear && debutYear.trim()) {
        err = validateYear(debutYear, 'Год дебюта');
        if (err) return err;
    }
    if (language && language.trim()) {
        err = validateOptionalString(language, 'Язык', 50);
        if (err) return err;
    }
    return null;
}

async function saveArtist() {
    const id = document.getElementById('artist-edit-id').value;
    const name = document.getElementById('artist-name').value.trim();
    const countryVal = document.getElementById('artist-country').value;
    const debutVal = document.getElementById('artist-debut-year').value.trim();
    const languageVal = document.getElementById('artist-language').value;
    const validationError = validateArtistFields(name, countryVal, debutVal, languageVal);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        name: name,
        country: countryVal === '' ? null : countryVal,
        debut_year: debutVal === '' ? null : parseInt(debutVal),
        language: languageVal === '' ? null : languageVal
    };
    let url = 'https://localhost:7062/api/Artists', method = 'POST', isUpdate = false;
    if (id) {
        data.artist_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!resp.ok) {
            let errorMsg = 'Ошибка сохранения';
            try {
                const error = await resp.json();
                if (error.message) errorMsg = error.message;
                else if (error.title && error.detail) errorMsg = error.detail;
                else if (error.errors) errorMsg = Object.values(error.errors).flat().join(' ');
            } catch (e) { errorMsg = await resp.text(); }
            showToast(errorMsg, 'error');
            return;
        }
        await loadArtists();
        clearArtistForm();
        await renderArtists();
        showToast(`Исполнитель «${name}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteArtist(id, name) {
    const confirmed = await showConfirmModal({
        title: 'Удаление исполнителя',
        message: `Удалить исполнителя «${name}» (ID ${id})?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`https://localhost:7062/api/Artists/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        clearArtistForm();
        await loadArtists();
        await renderArtists();
        showToast(`Исполнитель «${name}» удалён`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

function fillConcertForm(concert) {
    if (typeof openAddSection === 'function') {
        openAddSection('#concerts-tab .add-section-card');
    }
    const datetimeLocal = concert.datetime ? concert.datetime.slice(0, 16) : '';
    const titleInput = document.getElementById('concert-title');
    const venueInput = document.getElementById('concert-venue');
    const datetimeInput = document.getElementById('concert-datetime');
    const editIdInput = document.getElementById('concert-edit-id');
    const submitBtn = document.getElementById('concert-submit');
    const cancelBtn = document.getElementById('concert-cancel');

    if (titleInput) titleInput.value = concert.title;
    if (venueInput) venueInput.value = concert.venue;
    if (datetimeInput) datetimeInput.value = datetimeLocal;
    if (editIdInput) editIdInput.value = concert.concert_id;
    currentEditConcertId = concert.concert_id;

    const currentArtistIds = artistConcertLinks.filter(link => link.concert_id === concert.concert_id).map(link => link.artist_id);
    selectedArtistsForConcert = [...currentArtistIds];
    renderSelectedArtistsList();

    if (submitBtn) submitBtn.innerText = 'Сохранить';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    const fields = ['concert-title', 'concert-venue', 'concert-datetime'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });

    setTimeout(() => {
        if (titleInput && typeof validateRequiredString === 'function') {
            const error = validateRequiredString(titleInput.value, 'Название', 2, 150, true);
            if (typeof setFieldValidity === 'function') setFieldValidity(titleInput, !error, error);
        }
        if (venueInput && typeof validateRequiredString === 'function') {
            const error = validateRequiredString(venueInput.value, 'Место', 2, 100, true);
            if (typeof setFieldValidity === 'function') setFieldValidity(venueInput, !error, error);
        }
        if (datetimeInput && datetimeInput.value && typeof validateConcertDatetime === 'function') {
            const error = validateConcertDatetime(datetimeInput.value);
            if (typeof setFieldValidity === 'function') setFieldValidity(datetimeInput, !error, error);
        }
    }, 10);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearConcertForm() {
    const titleInput = document.getElementById('concert-title');
    const venueInput = document.getElementById('concert-venue');
    const datetimeInput = document.getElementById('concert-datetime');
    const editIdInput = document.getElementById('concert-edit-id');
    const submitBtn = document.getElementById('concert-submit');
    const cancelBtn = document.getElementById('concert-cancel');

    if (titleInput) titleInput.value = '';
    if (venueInput) venueInput.value = '';
    if (datetimeInput) datetimeInput.value = '';
    if (editIdInput) editIdInput.value = '';
    currentEditConcertId = null;
    selectedArtistsForConcert = [];
    renderSelectedArtistsList();
    if (submitBtn) submitBtn.innerText = 'Добавить';
    if (cancelBtn) cancelBtn.style.display = 'none';

    const fields = ['concert-title', 'concert-venue', 'concert-datetime'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });
}

function validateConcertFields(title, venue, datetime) {
    let err = validateRequiredString(title, 'Название', 2, 150, true);
    if (err) return err;
    err = validateRequiredString(venue, 'Место', 2, 100, true);
    if (err) return err;
    err = validateConcertDatetime(datetime);
    if (err) return err;
    return null;
}

async function saveConcert() {
    const id = document.getElementById('concert-edit-id').value;
    const title = document.getElementById('concert-title').value.trim();
    const venue = document.getElementById('concert-venue').value.trim();
    const datetimeInput = document.getElementById('concert-datetime').value;
    const datetime = datetimeInput ? new Date(datetimeInput).toISOString() : null;
    const artistIds = selectedArtistsForConcert;
    const validationError = validateConcertFields(title, venue, datetimeInput);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = { title, venue, datetime, artistIds };
    let url = 'https://localhost:7062/api/Concerts', method = 'POST', isUpdate = false;
    if (id) {
        data.concert_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка сохранения';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showToast(msg, 'error');
            return;
        }
        await loadConcerts();
        await loadArtistConcerts();
        clearConcertForm();
        await renderConcerts();
        showToast(`Концерт «${title}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteConcert(id, title) {
    const confirmed = await showConfirmModal({
        title: 'Удаление концерта',
        message: `Удалить концерт «${title}» (ID ${id})?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`https://localhost:7062/api/Concerts/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        clearConcertForm();
        await loadConcerts();
        await loadArtistConcerts();
        await renderConcerts();
        showToast(`Концерт «${title}» удалён`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

function openArtistsModal() {
    const modal = document.getElementById('artists-modal');
    const artistsListDiv = document.getElementById('modal-artists-list');
    const artistSelect = document.getElementById('modal-artist-select');
    if (!modal || !artistsListDiv || !artistSelect) return;
    artistsListDiv.innerHTML = '';
    if (selectedArtistsForConcert.length === 0) {
        artistsListDiv.innerHTML = '<p>Нет выбранных исполнителей</p>';
    } else {
        selectedArtistsForConcert.forEach(artistId => {
            const artist = allArtists.find(a => a.artist_id === artistId);
            const name = artist ? artist.name : `ID ${artistId}`;
            const div = document.createElement('div');
            div.className = 'selected-artist-item';
            div.innerHTML = `${name} <button class="remove-artist-from-modal" data-artist-id="${artistId}">Удалить</button>`;
            artistsListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-artist-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.artistId);
                selectedArtistsForConcert = selectedArtistsForConcert.filter(aid => aid !== id);
                renderSelectedArtistsList();
                openArtistsModal();
            });
        });
    }
    const availableArtists = allArtists.filter(a => !selectedArtistsForConcert.includes(a.artist_id));
    artistSelect.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
    availableArtists.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        artistSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function addArtistFromModal() {
    const artistId = parseInt(document.getElementById('modal-artist-select').value);
    if (!artistId) return;
    if (!selectedArtistsForConcert.includes(artistId)) {
        selectedArtistsForConcert.push(artistId);
        renderSelectedArtistsList();
        openArtistsModal();
    } else {
        showToast('Исполнитель уже выбран', 'warning');
    }
}

function closeArtistsModal() {
    const modal = document.getElementById('artists-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('artist-submit')?.addEventListener('click', saveArtist);
document.getElementById('artist-cancel')?.addEventListener('click', clearArtistForm);
document.getElementById('concert-submit')?.addEventListener('click', saveConcert);
document.getElementById('concert-cancel')?.addEventListener('click', clearConcertForm);
document.getElementById('open-artists-modal-btn')?.addEventListener('click', openArtistsModal);
document.getElementById('modal-add-artist')?.addEventListener('click', addArtistFromModal);
document.getElementById('modal-close')?.addEventListener('click', closeArtistsModal);
window.addEventListener('click', (e) => {
    const modal = document.getElementById('artists-modal');
    if (e.target === modal && modal) modal.style.display = 'none';
});
document.getElementById('apply-artist-filters')?.addEventListener('click', renderArtists);
document.getElementById('clear-artist-filters')?.addEventListener('click', () => {
    const searchName = document.getElementById('artist-search-name');
    const searchCountry = document.getElementById('artist-search-country');
    const searchLanguage = document.getElementById('artist-search-language');
    const artistSort = document.getElementById('artist-sort');
    if (searchName) searchName.value = '';
    if (searchCountry) searchCountry.value = '';
    if (searchLanguage) searchLanguage.value = '';
    if (artistSort) artistSort.value = 'name_asc';
    renderArtists();
});
document.getElementById('apply-concert-filters')?.addEventListener('click', renderConcerts);
document.getElementById('clear-concert-filters')?.addEventListener('click', () => {
    const searchTitle = document.getElementById('concert-search-title');
    const searchVenue = document.getElementById('concert-search-venue');
    const searchStatus = document.getElementById('concert-search-status');
    const searchArtist = document.getElementById('concert-search-artist');
    const concertSort = document.getElementById('concert-sort');
    if (searchTitle) searchTitle.value = '';
    if (searchVenue) searchVenue.value = '';
    if (searchStatus) searchStatus.value = '';
    if (searchArtist) searchArtist.value = '';
    if (concertSort) concertSort.value = 'date_asc';
    renderConcerts();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) tabContent.classList.add('active');
        if (tabName === 'artists') {
            await loadArtists();
            renderArtists();
            initArtistLiveValidation();
        } else if (tabName === 'concerts') {
            await Promise.all([loadArtists(), loadConcerts(), loadArtistConcerts()]);
            await loadArtistOptions();
            renderConcerts();
            initConcertLiveValidation();
        }
        setTimeout(function () {
            if (typeof initToggleFilters === 'function') initToggleFilters();
        }, 50);
    });
});

loadArtists().then(() => {
    renderArtists();
    initArtistLiveValidation();
});
loadArtistOptions();
initConcertLiveValidation();