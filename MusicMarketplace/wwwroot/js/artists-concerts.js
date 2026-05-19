// artists-concerts.js
const ARTISTS_URL = 'https://localhost:7062/api/Artists';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const ARTIST_CONCERTS_URL = 'https://localhost:7062/api/ArtistConcerts';

let allArtists = [];
let allConcerts = [];
let artistConcertLinks = [];

let currentEditArtistId = null;
let currentEditConcertId = null;
let currentModalConcertId = null;

function updateArtistFilterOptions() {
    const countries = [...new Set(allArtists.map(a => a.country).filter(c => c))].sort();
    const languages = [...new Set(allArtists.map(a => a.language).filter(l => l))].sort();
    const names = allArtists.map(a => a.name);
    const countrySelect = document.getElementById('artist-search-country');
    const languageSelect = document.getElementById('artist-search-language');
    const nameDatalist = document.getElementById('artist-name-datalist');
    countrySelect.innerHTML = '<option value="">Все страны</option>';
    countries.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; countrySelect.appendChild(opt); });
    languageSelect.innerHTML = '<option value="">Все языки</option><option value="Instrumental">Инструментальная (без языка)</option>';
    languages.forEach(lang => { const opt = document.createElement('option'); opt.value = lang; opt.textContent = lang; languageSelect.appendChild(opt); });
    nameDatalist.innerHTML = '';
    names.forEach(name => { const opt = document.createElement('option'); opt.value = name; nameDatalist.appendChild(opt); });
}

function updateConcertFilterOptions() {
    const venues = [...new Set(allConcerts.map(c => c.venue).filter(v => v))].sort();
    const titles = allConcerts.map(c => c.title);
    const venueSelect = document.getElementById('concert-search-venue');
    const titleDatalist = document.getElementById('concert-title-datalist');
    venueSelect.innerHTML = '<option value="">Все места</option>';
    venues.forEach(venue => { const opt = document.createElement('option'); opt.value = venue; opt.textContent = venue; venueSelect.appendChild(opt); });
    titleDatalist.innerHTML = '';
    titles.forEach(title => { const opt = document.createElement('option'); opt.value = title; titleDatalist.appendChild(opt); });
}

async function loadArtists() {
    const resp = await fetch(ARTISTS_URL);
    if (resp.ok) {
        allArtists = await resp.json();
        updateArtistFilterOptions();
    }
}

async function loadConcerts() {
    const resp = await fetch(CONCERTS_URL);
    if (resp.ok) {
        allConcerts = await resp.json();
        updateConcertFilterOptions();
    }
}

async function loadArtistConcerts() {
    const resp = await fetch(ARTIST_CONCERTS_URL);
    if (resp.ok) {
        artistConcertLinks = await resp.json();
    }
}

function getArtistNamesByIds(artistIds) {
    return artistIds.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    }).join(', ');
}

async function renderArtists() {
    const searchName = document.getElementById('artist-search-name').value.trim().toLowerCase();
    const searchCountry = document.getElementById('artist-search-country').value;
    const searchLanguage = document.getElementById('artist-search-language').value;

    let filtered = allArtists.filter(a => {
        if (searchName && !a.name.toLowerCase().includes(searchName)) return false;
        if (searchCountry && a.country !== searchCountry) return false;
        if (searchLanguage === 'Instrumental') {
            if (a.language !== null) return false;
        } else if (searchLanguage && a.language !== searchLanguage) return false;
        return true;
    });
    filtered.sort((a, b) => a.artist_id - b.artist_id);

    const tbody = document.getElementById('artists-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
        return;
    }
    filtered.forEach(artist => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = artist.artist_id;
        row.insertCell(1).textContent = artist.name;
        row.insertCell(2).textContent = artist.country || '';
        row.insertCell(3).textContent = artist.debut_year || '';
        row.insertCell(4).textContent = artist.language || '';
        const actions = row.insertCell(5);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.className = 'edit-btn';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => fillArtistForm(artist);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteArtist(artist.artist_id, artist.name);
        actions.append(editBtn, delBtn);
    });
}

function clearArtistForm() {
    document.getElementById('artist-name').value = '';
    document.getElementById('artist-country').value = '';
    document.getElementById('artist-debut-year').value = '';
    document.getElementById('artist-language').value = '';
    document.getElementById('artist-edit-id').value = '';
    currentEditArtistId = null;
    document.getElementById('artist-form-title').innerText = 'Добавить исполнителя';
    document.getElementById('artist-submit').innerText = 'Добавить';
    document.getElementById('artist-cancel').style.display = 'none';
}

function fillArtistForm(artist) {
    document.getElementById('artist-name').value = artist.name;
    document.getElementById('artist-country').value = artist.country || '';
    document.getElementById('artist-debut-year').value = artist.debut_year || '';
    document.getElementById('artist-language').value = artist.language || '';
    document.getElementById('artist-edit-id').value = artist.artist_id;
    currentEditArtistId = artist.artist_id;
    document.getElementById('artist-form-title').innerText = 'Редактировать исполнителя';
    document.getElementById('artist-submit').innerText = 'Сохранить';
    document.getElementById('artist-cancel').style.display = 'inline-block';
}

async function saveArtist() {
    const id = document.getElementById('artist-edit-id').value;
    const name = document.getElementById('artist-name').value.trim();
    if (!name) { showToast('Имя обязательно', 'error'); return; }
    const data = {
        name: name,
        country: document.getElementById('artist-country').value.trim() || null,
        debut_year: document.getElementById('artist-debut-year').value ? parseInt(document.getElementById('artist-debut-year').value) : null,
        language: document.getElementById('artist-language').value.trim() || null
    };
    let url = ARTISTS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.artist_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой исполнитель уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadArtists();
        clearArtistForm();
        await renderArtists();
        showToast(`Исполнитель «${name}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteArtist(id, name) {
    if (!confirm(`Удалить исполнителя «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${ARTISTS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadArtists();
        await renderArtists();
        showToast(`Исполнитель «${name}» удалён`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

async function renderConcerts() {
    const searchTitle = document.getElementById('concert-search-title').value.trim().toLowerCase();
    const searchVenue = document.getElementById('concert-search-venue').value;
    const searchDate = document.getElementById('concert-search-date').value;

    let filtered = allConcerts.filter(c => {
        if (searchTitle && !c.title.toLowerCase().includes(searchTitle)) return false;
        if (searchVenue && c.venue !== searchVenue) return false;
        if (searchDate && new Date(c.datetime).toISOString().slice(0, 10) !== searchDate) return false;
        return true;
    });
    filtered.sort((a, b) => a.concert_id - b.concert_id);

    const tbody = document.getElementById('concerts-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<td><td colspan="6">Нет данных</td></tr>';
        return;
    }
    for (const concert of filtered) {
        const artistIds = artistConcertLinks.filter(link => link.concert_id === concert.concert_id).map(link => link.artist_id);
        const artistNames = getArtistNamesByIds(artistIds);
        const row = tbody.insertRow();
        row.insertCell(0).textContent = concert.concert_id;
        row.insertCell(1).textContent = concert.title;
        row.insertCell(2).textContent = concert.venue;
        row.insertCell(3).textContent = new Date(concert.datetime).toLocaleString();
        row.insertCell(4).textContent = artistNames || '—';
        const actions = row.insertCell(5);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.className = 'edit-btn';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => fillConcertForm(concert);
        const artistsBtn = document.createElement('button');
        artistsBtn.textContent = 'Артисты';
        artistsBtn.style.background = '#ffc107';
        artistsBtn.style.marginRight = '5px';
        artistsBtn.onclick = () => openArtistsModal(concert.concert_id);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteConcert(concert.concert_id, concert.title);
        actions.append(editBtn, artistsBtn, delBtn);
    }
}

function clearConcertForm() {
    document.getElementById('concert-title').value = '';
    document.getElementById('concert-venue').value = '';
    document.getElementById('concert-datetime').value = '';
    document.getElementById('concert-edit-id').value = '';
    currentEditConcertId = null;
    document.getElementById('concert-form-title').innerText = 'Добавить концерт';
    document.getElementById('concert-submit').innerText = 'Добавить';
    document.getElementById('concert-cancel').style.display = 'none';
}

function fillConcertForm(concert) {
    const datetimeLocal = concert.datetime ? new Date(concert.datetime).toISOString().slice(0, 16) : '';
    document.getElementById('concert-title').value = concert.title;
    document.getElementById('concert-venue').value = concert.venue;
    document.getElementById('concert-datetime').value = datetimeLocal;
    document.getElementById('concert-edit-id').value = concert.concert_id;
    currentEditConcertId = concert.concert_id;
    document.getElementById('concert-form-title').innerText = 'Редактировать концерт';
    document.getElementById('concert-submit').innerText = 'Сохранить';
    document.getElementById('concert-cancel').style.display = 'inline-block';
}

async function saveConcert() {
    const id = document.getElementById('concert-edit-id').value;
    const title = document.getElementById('concert-title').value.trim();
    const venue = document.getElementById('concert-venue').value.trim();
    const datetime = document.getElementById('concert-datetime').value;
    if (!title || !venue || !datetime) {
        showToast('Заполните все обязательные поля', 'error');
        return;
    }
    const data = { title, venue, datetime };
    let url = CONCERTS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.concert_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой концерт уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadConcerts();
        clearConcertForm();
        await renderConcerts();
        showToast(`Концерт «${title}» ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteConcert(id, title) {
    if (!confirm(`Удалить концерт «${title}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${CONCERTS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadConcerts();
        await loadArtistConcerts();
        await renderConcerts();
        showToast(`Концерт «${title}» удалён`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

async function openArtistsModal(concertId) {
    currentModalConcertId = concertId;
    const modal = document.getElementById('artists-modal');
    const artistsListDiv = document.getElementById('modal-artists-list');
    const artistSelect = document.getElementById('modal-artist-select');
    const currentArtistIds = artistConcertLinks.filter(link => link.concert_id === concertId).map(link => link.artist_id);
    artistsListDiv.innerHTML = '';
    if (currentArtistIds.length === 0) {
        artistsListDiv.innerHTML = '<p>Нет артистов</p>';
    } else {
        currentArtistIds.forEach(artistId => {
            const artist = allArtists.find(a => a.artist_id === artistId);
            const name = artist ? artist.name : `ID ${artistId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-artist-btn" data-artist-id="${artistId}">Удалить</button>`;
            artistsListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-artist-btn').forEach(btn => {
            btn.addEventListener('click', () => removeArtistFromConcert(parseInt(btn.dataset.artistId), concertId));
        });
    }
    const availableArtists = allArtists.filter(a => !currentArtistIds.includes(a.artist_id));
    artistSelect.innerHTML = '<option value="">-- Добавить артиста --</option>';
    availableArtists.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        artistSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

async function addArtistToConcert() {
    const artistId = parseInt(document.getElementById('modal-artist-select').value);
    if (!artistId) return;
    const data = { artist_id: artistId, concert_id: currentModalConcertId };
    try {
        const resp = await fetch(ARTIST_CONCERTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            await loadArtistConcerts();
            await renderConcerts();
            await openArtistsModal(currentModalConcertId);
            showToast('Артист добавлен к концерту', 'success');
        } else {
            showToast('Ошибка добавления', 'error');
        }
    } catch (err) {
        showToast('Ошибка сети', 'error');
    }
}

async function removeArtistFromConcert(artistId, concertId) {
    try {
        const resp = await fetch(`${ARTIST_CONCERTS_URL}/${artistId}/${concertId}`, { method: 'DELETE' });
        if (resp.ok) {
            await loadArtistConcerts();
            await renderConcerts();
            await openArtistsModal(concertId);
            showToast('Артист удалён из концерта', 'success');
        } else {
            showToast('Ошибка удаления', 'error');
        }
    } catch (err) {
        showToast('Ошибка сети', 'error');
    }
}

document.getElementById('artist-submit').addEventListener('click', saveArtist);
document.getElementById('artist-cancel').addEventListener('click', clearArtistForm);
document.getElementById('concert-submit').addEventListener('click', saveConcert);
document.getElementById('concert-cancel').addEventListener('click', clearConcertForm);
document.getElementById('apply-artist-filters').addEventListener('click', renderArtists);
document.getElementById('clear-artist-filters').addEventListener('click', () => {
    document.getElementById('artist-search-name').value = '';
    document.getElementById('artist-search-country').value = '';
    document.getElementById('artist-search-language').value = '';
    renderArtists();
});
document.getElementById('apply-concert-filters').addEventListener('click', renderConcerts);
document.getElementById('clear-concert-filters').addEventListener('click', () => {
    document.getElementById('concert-search-title').value = '';
    document.getElementById('concert-search-venue').value = '';
    document.getElementById('concert-search-date').value = '';
    renderConcerts();
});
document.getElementById('modal-add-artist').addEventListener('click', addArtistToConcert);
document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('artists-modal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    const modal = document.getElementById('artists-modal');
    if (e.target === modal) modal.style.display = 'none';
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'artists') {
            await loadArtists();
            renderArtists();
        } else if (btn.dataset.tab === 'concerts') {
            await Promise.all([loadArtists(), loadConcerts(), loadArtistConcerts()]);
            renderConcerts();
        }
    });
});

loadArtists().then(renderArtists);