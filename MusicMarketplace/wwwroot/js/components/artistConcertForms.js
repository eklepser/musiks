// js/components/artistConcertForms.js
window.ArtistConcertForms = (function () {
    let allArtists = [];
    let allConcerts = [];
    let artistConcertLinks = [];
    let currentEditArtistId = null;
    let currentEditConcertId = null;
    let selectedArtistsForConcert = [];

    async function loadArtists() {
        try {
            const resp = await fetch(window.API_URLS.ARTISTS);
            if (resp.ok) {
                allArtists = await resp.json();
                window.allArtists = allArtists;
                if (typeof window.updateArtistFilterCountries === 'function') {
                    window.updateArtistFilterCountries(allArtists.map(a => a.country));
                    window.updateArtistFilterLanguages(allArtists.map(a => a.language));
                }
                updateModalArtistSelect();
                updateOpenArtistsButtonVisibility();
                updateArtistFilterOptions();
            }
        } catch (e) { console.error(e); }
    }

    async function loadConcerts() {
        try {
            const resp = await fetch(window.API_URLS.CONCERTS);
            if (resp.ok) allConcerts = await resp.json();
            updateConcertFilterOptions();
        } catch (e) { console.error(e); }
    }

    async function loadArtistConcerts() {
        try {
            const resp = await fetch(window.API_URLS.ARTIST_CONCERTS);
            if (resp.ok) artistConcertLinks = await resp.json();
            else console.error('Failed to load artist-concert links');
        } catch (e) { console.error(e); }
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
        if (btn) btn.style.display = allArtists.length === 0 ? 'none' : 'inline-block';
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
            countries.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; countrySelect.appendChild(opt); });
        }
        if (languageSelect) {
            languageSelect.innerHTML = '<option value="">Все языки</option><option value="Instrumental">Инструментальная (без языка)</option>';
            languages.forEach(lang => { const opt = document.createElement('option'); opt.value = lang; opt.textContent = lang; languageSelect.appendChild(opt); });
        }
        if (nameDatalist) {
            nameDatalist.innerHTML = '';
            names.forEach(name => { const opt = document.createElement('option'); opt.value = name; nameDatalist.appendChild(opt); });
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
            venues.forEach(venue => { const opt = document.createElement('option'); opt.value = venue; opt.textContent = venue; venueSelect.appendChild(opt); });
        }
        if (venueDatalist) {
            venueDatalist.innerHTML = '';
            venues.forEach(venue => { const opt = document.createElement('option'); opt.value = venue; venueDatalist.appendChild(opt); });
        }
        if (titleDatalist) {
            titleDatalist.innerHTML = '';
            titles.forEach(title => { const opt = document.createElement('option'); opt.value = title; titleDatalist.appendChild(opt); });
        }
    }

    function renderSelectedArtistsList() {
        const container = document.getElementById('selected-artists-list');
        if (!container) return;
        if (!selectedArtistsForConcert || selectedArtistsForConcert.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
            return;
        }
        const names = selectedArtistsForConcert.map(id => {
            const artist = allArtists.find(a => a.artist_id === id);
            return artist ? artist.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }

    async function renderArtistsTable() {
        const searchName = document.getElementById('artist-search-name')?.value.trim() || '';
        const searchCountry = document.getElementById('artist-search-country')?.value || '';
        const searchLanguage = document.getElementById('artist-search-language')?.value || '';
        const sortBy = document.getElementById('artist-sort')?.value || 'name_asc';
        let url = `${window.API_URLS.ARTISTS_FILTER}?`;
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
                editBtn.onclick = () => window.ArtistConcertForms.fillArtistForm(artist);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => window.ArtistConcertForms.deleteArtist(artist.artist_id, artist.name);
                btnRow.append(editBtn, delBtn);
                actions.appendChild(btnRow);
            });
        } catch (err) {
            const tbody = document.getElementById('artists-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Ошибка загрузки</tbody>';
        }
    }

    async function renderConcertsTable() {
        const searchTitle = document.getElementById('concert-search-title')?.value.trim() || '';
        const searchVenue = document.getElementById('concert-search-venue')?.value || '';
        const searchStatus = document.getElementById('concert-search-status')?.value || '';
        const searchArtist = document.getElementById('concert-search-artist')?.value || '';
        const sortBy = document.getElementById('concert-sort')?.value || 'date_asc';
        let url = `${window.API_URLS.CONCERTS_FILTER}?`;
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
                editBtn.onclick = () => window.ArtistConcertForms.fillConcertForm(concert);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => window.ArtistConcertForms.deleteConcert(concert.concert_id, concert.title);
                btnRow.append(editBtn, delBtn);
                actions.appendChild(btnRow);
            }
        } catch (err) {
            const tbody = document.getElementById('concerts-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="centered-message">Ошибка загрузки</tbody>';
        }
    }

    async function loadArtistOptions() {
        try {
            const resp = await fetch(window.API_URLS.CONCERTS_ARTISTS);
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
        } catch (e) { console.error(e); }
    }

    function initArtistLiveValidation() {
        const fields = [
            { id: 'artist-name', required: true, validator: (v) => window.validateRequiredString(v, 'Имя', 2, 100, true) },
            { id: 'artist-country', required: false, validator: (v) => v && v.trim() ? window.validateOptionalString(v, 'Страна', 50) : null },
            { id: 'artist-debut-year', required: false, validator: (v) => v && v.trim() ? window.validateYear(v, 'Год дебюта') : null },
            { id: 'artist-language', required: false, validator: (v) => v && v.trim() ? window.validateOptionalString(v, 'Язык', 50) : null }
        ];
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el && typeof window.attachLiveValidation === 'function') window.attachLiveValidation(el, f.validator, f.required);
        });
    }

    function initConcertLiveValidation() {
        const fields = [
            { id: 'concert-title', required: true, validator: (v) => window.validateRequiredString(v, 'Название', 2, 150, true) },
            { id: 'concert-venue', required: true, validator: (v) => window.validateRequiredString(v, 'Место', 2, 100, true) },
            { id: 'concert-datetime', required: true, validator: (v) => v ? window.validateConcertDatetime(v) : 'Дата и время обязательны' }
        ];
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el && typeof window.attachLiveValidation === 'function') window.attachLiveValidation(el, f.validator, f.required);
        });
    }

    function fillArtistForm(artist) {
        if (typeof window.openAddSection === 'function') window.openAddSection('#artists-tab .add-section-card');
        const titleEl = document.querySelector('#artists-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Редактирование исполнителя';
        document.getElementById('artist-name').value = artist.name;
        document.getElementById('artist-country').value = artist.country || '';
        document.getElementById('artist-debut-year').value = artist.debut_year || '';
        document.getElementById('artist-language').value = artist.language || '';
        document.getElementById('artist-edit-id').value = artist.artist_id;
        currentEditArtistId = artist.artist_id;
        document.getElementById('artist-submit').innerText = 'Сохранить';
        document.getElementById('artist-cancel').style.display = 'inline-block';
        ['artist-name', 'artist-country', 'artist-debut-year', 'artist-language'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
        setTimeout(() => {
            if (document.getElementById('artist-name') && typeof window.validateRequiredString === 'function') {
                const error = window.validateRequiredString(document.getElementById('artist-name').value, 'Имя', 2, 100, true);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('artist-name'), !error, error);
            }
            if (document.getElementById('artist-country') && document.getElementById('artist-country').value.trim() && typeof window.validateOptionalString === 'function') {
                const error = window.validateOptionalString(document.getElementById('artist-country').value, 'Страна', 50);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('artist-country'), !error, error);
            }
            if (document.getElementById('artist-debut-year') && document.getElementById('artist-debut-year').value.trim() && typeof window.validateYear === 'function') {
                const error = window.validateYear(document.getElementById('artist-debut-year').value, 'Год дебюта');
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('artist-debut-year'), !error, error);
            }
            if (document.getElementById('artist-language') && document.getElementById('artist-language').value.trim() && typeof window.validateOptionalString === 'function') {
                const error = window.validateOptionalString(document.getElementById('artist-language').value, 'Язык', 50);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('artist-language'), !error, error);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearArtistForm() {
        const titleEl = document.querySelector('#artists-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Добавление исполнителя';
        document.getElementById('artist-name').value = '';
        document.getElementById('artist-country').value = '';
        document.getElementById('artist-debut-year').value = '';
        document.getElementById('artist-language').value = '';
        document.getElementById('artist-edit-id').value = '';
        currentEditArtistId = null;
        document.getElementById('artist-submit').innerText = 'Добавить';
        document.getElementById('artist-cancel').style.display = 'none';
        ['artist-name', 'artist-country', 'artist-debut-year', 'artist-language'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
    }

    function validateArtistFields(name, country, debutYear, language) {
        let err = window.validateRequiredString(name, 'Имя', 2, 100, true);
        if (err) return err;
        if (country && country.trim()) {
            err = window.validateOptionalString(country, 'Страна', 50);
            if (err) return err;
        }
        if (debutYear && debutYear.trim()) {
            err = window.validateYear(debutYear, 'Год дебюта');
            if (err) return err;
        }
        if (language && language.trim()) {
            err = window.validateOptionalString(language, 'Язык', 50);
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
        if (validationError) { window.showToast(validationError, 'error'); return; }
        const data = {
            name,
            country: countryVal === '' ? null : countryVal,
            debut_year: debutVal === '' ? null : parseInt(debutVal),
            language: languageVal === '' ? null : languageVal
        };
        let url = window.API_URLS.ARTISTS, method = 'POST', isUpdate = false;
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
                window.showToast(errorMsg, 'error');
                return;
            }
            await loadArtists();
            clearArtistForm();
            await renderArtistsTable();
            window.showToast(`Исполнитель «${name}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
        } catch (err) { window.showToast('Ошибка сохранения', 'error'); }
    }

    async function deleteArtist(id, name) {
        const confirmed = await window.showConfirmModal({
            title: 'Удаление исполнителя',
            message: `Удалить исполнителя «${name}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const resp = await fetch(`${window.API_URLS.ARTISTS}/${id}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            clearArtistForm();
            await loadArtists();
            await renderArtistsTable();
            window.showToast(`Исполнитель «${name}» удалён`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
    }

    async function fillConcertForm(concert) {
        if (typeof window.openAddSection === 'function') window.openAddSection('#concerts-tab .add-section-card');
        const titleEl = document.querySelector('#concerts-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Редактирование концерта';
        let concertData = concert;
        if (concert && concert.concert_id) {
            try {
                const resp = await fetch(`${window.API_URLS.CONCERTS}/${concert.concert_id}`);
                if (resp.ok) concertData = await resp.json();
            } catch (e) { console.warn(e); }
        }
        let artistIds = [];
        if (concert && concert.concert_id) {
            try {
                const resp = await fetch(`${window.API_URLS.ARTIST_CONCERTS}/byConcert/${concert.concert_id}`);
                if (resp.ok) {
                    const links = await resp.json();
                    artistIds = links.map(link => link.artist_id);
                }
            } catch (e) { console.warn(e); }
        }
        const datetimeLocal = concertData.datetime ? concertData.datetime.slice(0, 16) : '';
        document.getElementById('concert-title').value = concertData.title;
        document.getElementById('concert-venue').value = concertData.venue;
        document.getElementById('concert-datetime').value = datetimeLocal;
        document.getElementById('concert-edit-id').value = concertData.concert_id;
        currentEditConcertId = concertData.concert_id;
        selectedArtistsForConcert = [...artistIds];
        renderSelectedArtistsList();
        document.getElementById('concert-submit').innerText = 'Сохранить';
        document.getElementById('concert-cancel').style.display = 'inline-block';
        ['concert-title', 'concert-venue', 'concert-datetime'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
        setTimeout(() => {
            if (document.getElementById('concert-title') && typeof window.validateRequiredString === 'function') {
                const error = window.validateRequiredString(document.getElementById('concert-title').value, 'Название', 2, 150, true);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('concert-title'), !error, error);
            }
            if (document.getElementById('concert-venue') && typeof window.validateRequiredString === 'function') {
                const error = window.validateRequiredString(document.getElementById('concert-venue').value, 'Место', 2, 100, true);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('concert-venue'), !error, error);
            }
            if (document.getElementById('concert-datetime') && document.getElementById('concert-datetime').value && typeof window.validateConcertDatetime === 'function') {
                const error = window.validateConcertDatetime(document.getElementById('concert-datetime').value);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('concert-datetime'), !error, error);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearConcertForm() {
        const titleEl = document.querySelector('#concerts-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Добавление концерта';
        document.getElementById('concert-title').value = '';
        document.getElementById('concert-venue').value = '';
        document.getElementById('concert-datetime').value = '';
        document.getElementById('concert-edit-id').value = '';
        currentEditConcertId = null;
        selectedArtistsForConcert = [];
        renderSelectedArtistsList();
        document.getElementById('concert-submit').innerText = 'Добавить';
        document.getElementById('concert-cancel').style.display = 'none';
        ['concert-title', 'concert-venue', 'concert-datetime'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
    }

    function validateConcertFields(title, venue, datetime) {
        let err = window.validateRequiredString(title, 'Название', 2, 150, true);
        if (err) return err;
        err = window.validateRequiredString(venue, 'Место', 2, 100, true);
        if (err) return err;
        err = window.validateConcertDatetime(datetime);
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
        if (validationError) { window.showToast(validationError, 'error'); return; }
        const data = { title, venue, datetime, artistIds };
        let url = window.API_URLS.CONCERTS, method = 'POST', isUpdate = false;
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
                window.showToast(msg, 'error');
                return;
            }
            await loadConcerts();
            await loadArtistConcerts();
            clearConcertForm();
            await renderConcertsTable();
            window.showToast(`Концерт «${title}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
        } catch (err) { window.showToast('Ошибка сохранения', 'error'); }
    }

    async function deleteConcert(id, title) {
        const confirmed = await window.showConfirmModal({
            title: 'Удаление концерта',
            message: `Удалить концерт «${title}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const resp = await fetch(`${window.API_URLS.CONCERTS}/${id}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            clearConcertForm();
            await loadConcerts();
            await loadArtistConcerts();
            await renderConcertsTable();
            window.showToast(`Концерт «${title}» удалён`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
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
            window.showToast('Исполнитель уже выбран', 'warning');
        }
    }

    function closeArtistsModal() {
        const modal = document.getElementById('artists-modal');
        if (modal) modal.style.display = 'none';
    }

    return {
        loadArtists, loadConcerts, loadArtistConcerts,
        renderArtistsTable, renderConcertsTable,
        loadArtistOptions,
        initArtistLiveValidation, initConcertLiveValidation,
        fillArtistForm, clearArtistForm, saveArtist, deleteArtist,
        fillConcertForm, clearConcertForm, saveConcert, deleteConcert,
        openArtistsModal, addArtistFromModal, closeArtistsModal,
        updateArtistFilterOptions, updateConcertFilterOptions
    };
})();