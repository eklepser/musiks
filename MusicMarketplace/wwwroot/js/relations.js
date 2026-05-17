const ARTIST_CONCERTS_URL = 'https://localhost:7062/api/ArtistConcerts';
const ARTIST_MERCHES_URL = 'https://localhost:7062/api/ArtistMerches';
const PRODUCT_GENRES_URL = 'https://localhost:7062/api/ProductGenres';
const ARTISTS_URL = 'https://localhost:7062/api/Artists';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MERCHES_URL = 'https://localhost:7062/api/Merches';
const PRODUCTS_URL = 'https://localhost:7062/api/Products';
const GENRES_URL = 'https://localhost:7062/api/Genres';

async function loadSelect(url, selectId, textField, valueField) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const items = await resp.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Выберите</option>';
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueField];
            opt.textContent = item[textField];
            select.appendChild(opt);
        });
    } catch (err) { console.error(err); }
}

async function loadArtistConcert() {
    try {
        const resp = await fetch(ARTIST_CONCERTS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        const tbody = document.getElementById('ac-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = rel.artist_name;
            row.insertCell(1).textContent = rel.concert_title;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation(ARTIST_CONCERTS_URL, rel.artist_id, rel.concert_id, loadArtistConcert);
            actions.appendChild(delBtn);
        }
    } catch (err) {
        document.getElementById('ac-tbody').innerHTML = '<tr><td colspan="3">Ошибка загрузки</td></tr>';
        console.error(err);
    }
}

async function addArtistConcert() {
    const artistId = parseInt(document.getElementById('ac-artist-id').value);
    const concertId = parseInt(document.getElementById('ac-concert-id').value);
    if (!artistId || !concertId) { showMessage('ac', 'Выберите значения', true); return; }
    const resp = await fetch(ARTIST_CONCERTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist_id: artistId, concert_id: concertId })
    });
    if (resp.ok) {
        showMessage('ac', 'Связь добавлена', false);
        loadArtistConcert();
        document.getElementById('ac-artist-id').value = '';
        document.getElementById('ac-concert-id').value = '';
    } else {
        const errText = await resp.text();
        showMessage('ac', 'Ошибка: ' + resp.status + ' ' + errText, true);
    }
}

async function loadArtistMerch() {
    try {
        const resp = await fetch(ARTIST_MERCHES_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        const tbody = document.getElementById('am-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = rel.artist_name;
            row.insertCell(1).textContent = rel.product_name;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation(ARTIST_MERCHES_URL, rel.artist_id, rel.merch_id, loadArtistMerch);
            actions.appendChild(delBtn);
        }
    } catch (err) {
        document.getElementById('am-tbody').innerHTML = '<tr><td colspan="3">Ошибка загрузки</td></tr>';
        console.error(err);
    }
}

async function addArtistMerch() {
    const artistId = parseInt(document.getElementById('am-artist-id').value);
    const merchId = parseInt(document.getElementById('am-merch-id').value);
    if (!artistId || !merchId) { showMessage('am', 'Выберите значения', true); return; }
    const resp = await fetch(ARTIST_MERCHES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist_id: artistId, merch_id: merchId })
    });
    if (resp.ok) {
        showMessage('am', 'Связь добавлена', false);
        loadArtistMerch();
        document.getElementById('am-artist-id').value = '';
        document.getElementById('am-merch-id').value = '';
    } else {
        const errText = await resp.text();
        showMessage('am', 'Ошибка: ' + resp.status + ' ' + errText, true);
    }
}

async function loadProductGenre() {
    try {
        const resp = await fetch(PRODUCT_GENRES_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        const tbody = document.getElementById('pg-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = rel.product_name;
            row.insertCell(1).textContent = rel.genre_name;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation(PRODUCT_GENRES_URL, rel.product_id, rel.genre_id, loadProductGenre);
            actions.appendChild(delBtn);
        }
    } catch (err) {
        document.getElementById('pg-tbody').innerHTML = '<tr><td colspan="3">Ошибка загрузки</td></tr>';
        console.error(err);
    }
}

async function addProductGenre() {
    const productId = parseInt(document.getElementById('pg-product-id').value);
    const genreId = parseInt(document.getElementById('pg-genre-id').value);
    if (!productId || !genreId) { showMessage('pg', 'Выберите значения', true); return; }
    const resp = await fetch(PRODUCT_GENRES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, genre_id: genreId })
    });
    if (resp.ok) {
        showMessage('pg', 'Связь добавлена', false);
        loadProductGenre();
        document.getElementById('pg-product-id').value = '';
        document.getElementById('pg-genre-id').value = '';
    } else {
        const errText = await resp.text();
        showMessage('pg', 'Ошибка: ' + resp.status + ' ' + errText, true);
    }
}

async function deleteRelation(baseUrl, id1, id2, reloadFunction) {
    if (!confirm('Удалить связь?')) return;
    const resp = await fetch(`${baseUrl}/${id1}/${id2}`, { method: 'DELETE' });
    if (resp.ok) {
        reloadFunction();
        showMessage('del', 'Связь удалена', false);
    } else {
        showMessage('del', 'Ошибка удаления', true);
    }
}

function showMessage(prefix, text, isError) {
    const errDiv = document.getElementById(`${prefix}-error`);
    const sucDiv = document.getElementById(`${prefix}-success`);
    if (isError) {
        if (errDiv) { errDiv.textContent = text; errDiv.classList.add('show'); }
        if (sucDiv) sucDiv.classList.remove('show');
        setTimeout(() => { if (errDiv) errDiv.classList.remove('show'); }, 5000);
    } else {
        if (sucDiv) { sucDiv.textContent = text; sucDiv.classList.add('show'); }
        if (errDiv) errDiv.classList.remove('show');
        setTimeout(() => { if (sucDiv) sucDiv.classList.remove('show'); }, 3000);
    }
}

document.getElementById('ac-add-btn').addEventListener('click', addArtistConcert);
document.getElementById('am-add-btn').addEventListener('click', addArtistMerch);
document.getElementById('pg-add-btn').addEventListener('click', addProductGenre);

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'artist-concert') {
            loadArtistConcert();
            loadSelect(ARTISTS_URL, 'ac-artist-id', 'name', 'artist_id');
            loadSelect(CONCERTS_URL, 'ac-concert-id', 'title', 'concert_id');
        } else if (btn.dataset.tab === 'artist-merch') {
            loadArtistMerch();
            loadSelect(ARTISTS_URL, 'am-artist-id', 'name', 'artist_id');
            loadSelect(MERCHES_URL, 'am-merch-id', 'merch_id', 'merch_id');
        } else if (btn.dataset.tab === 'product-genre') {
            loadProductGenre();
            loadSelect(PRODUCTS_URL, 'pg-product-id', 'name', 'product_id');
            loadSelect(GENRES_URL, 'pg-genre-id', 'name', 'genre_id');
        }
    });
});

loadSelect(ARTISTS_URL, 'ac-artist-id', 'name', 'artist_id');
loadSelect(CONCERTS_URL, 'ac-concert-id', 'title', 'concert_id');
loadSelect(ARTISTS_URL, 'am-artist-id', 'name', 'artist_id');
loadSelect(MERCHES_URL, 'am-merch-id', 'merch_id', 'merch_id');
loadSelect(PRODUCTS_URL, 'pg-product-id', 'name', 'product_id');
loadSelect(GENRES_URL, 'pg-genre-id', 'name', 'genre_id');

loadArtistConcert();