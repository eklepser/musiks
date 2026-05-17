const API_BASE = 'https://localhost:7062/api';

async function loadSelect(url, selectId, textField, valueField) {
    const resp = await fetch(url);
    if (resp.ok) {
        const items = await resp.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Выберите</option>';
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueField];
            opt.textContent = item[textField];
            select.appendChild(opt);
        });
    }
}

async function loadArtistConcert() {
    const resp = await fetch(`${API_BASE}/ArtistConcerts`);
    if (resp.ok) {
        let data = await resp.json();
        const tbody = document.getElementById('ac-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const artistResp = await fetch(`${API_BASE}/Artists/${rel.artistId}`);
            const concertResp = await fetch(`${API_BASE}/Concerts/${rel.concertId}`);
            const artistName = artistResp.ok ? (await artistResp.json()).name : `ID ${rel.artistId}`;
            const concertTitle = concertResp.ok ? (await concertResp.json()).title : `ID ${rel.concertId}`;
            const row = tbody.insertRow();
            row.insertCell(0).textContent = artistName;
            row.insertCell(1).textContent = concertTitle;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation('ArtistConcerts', rel.artistId, rel.concertId);
            actions.appendChild(delBtn);
        }
    }
}

async function addArtistConcert() {
    const artistId = parseInt(document.getElementById('ac-artist-id').value);
    const concertId = parseInt(document.getElementById('ac-concert-id').value);
    if (!artistId || !concertId) { showMessage('ac', 'Выберите значения', true); return; }
    const resp = await fetch(`${API_BASE}/ArtistConcerts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, concertId })
    });
    if (resp.ok) {
        showMessage('ac', 'Связь добавлена', false);
        loadArtistConcert();
        document.getElementById('ac-artist-id').value = '';
        document.getElementById('ac-concert-id').value = '';
    } else showMessage('ac', 'Ошибка (возможно дубликат)', true);
}

async function loadArtistMerch() {
    const resp = await fetch(`${API_BASE}/ArtistMerch`);
    if (resp.ok) {
        let data = await resp.json();
        const tbody = document.getElementById('am-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const artistResp = await fetch(`${API_BASE}/Artists/${rel.artistId}`);
            const merchResp = await fetch(`${API_BASE}/Merch/${rel.merchId}`);
            let artistName = artistResp.ok ? (await artistResp.json()).name : `ID ${rel.artistId}`;
            let merchInfo = `ID ${rel.merchId}`;
            if (merchResp.ok) {
                const merch = await merchResp.json();
                const prodResp = await fetch(`${API_BASE}/Products/${merch.productId}`);
                if (prodResp.ok) merchInfo = (await prodResp.json()).name;
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = artistName;
            row.insertCell(1).textContent = merchInfo;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation('ArtistMerch', rel.artistId, rel.merchId);
            actions.appendChild(delBtn);
        }
    }
}

async function addArtistMerch() {
    const artistId = parseInt(document.getElementById('am-artist-id').value);
    const merchId = parseInt(document.getElementById('am-merch-id').value);
    if (!artistId || !merchId) { showMessage('am', 'Выберите значения', true); return; }
    const resp = await fetch(`${API_BASE}/ArtistMerch`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, merchId })
    });
    if (resp.ok) {
        showMessage('am', 'Связь добавлена', false);
        loadArtistMerch();
        document.getElementById('am-artist-id').value = '';
        document.getElementById('am-merch-id').value = '';
    } else showMessage('am', 'Ошибка', true);
}

async function loadProductGenre() {
    const resp = await fetch(`${API_BASE}/ProductGenres`);
    if (resp.ok) {
        let data = await resp.json();
        const tbody = document.getElementById('pg-tbody');
        tbody.innerHTML = '';
        if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Нет связей</td></tr>'; return; }
        for (const rel of data) {
            const productResp = await fetch(`${API_BASE}/Products/${rel.productId}`);
            const genreResp = await fetch(`${API_BASE}/Genres/${rel.genreId}`);
            const productName = productResp.ok ? (await productResp.json()).name : `ID ${rel.productId}`;
            const genreName = genreResp.ok ? (await genreResp.json()).name : `ID ${rel.genreId}`;
            const row = tbody.insertRow();
            row.insertCell(0).textContent = productName;
            row.insertCell(1).textContent = genreName;
            const actions = row.insertCell(2);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteRelation('ProductGenres', rel.productId, rel.genreId);
            actions.appendChild(delBtn);
        }
    }
}

async function addProductGenre() {
    const productId = parseInt(document.getElementById('pg-product-id').value);
    const genreId = parseInt(document.getElementById('pg-genre-id').value);
    if (!productId || !genreId) { showMessage('pg', 'Выберите значения', true); return; }
    const resp = await fetch(`${API_BASE}/ProductGenres`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, genreId })
    });
    if (resp.ok) {
        showMessage('pg', 'Связь добавлена', false);
        loadProductGenre();
        document.getElementById('pg-product-id').value = '';
        document.getElementById('pg-genre-id').value = '';
    } else showMessage('pg', 'Ошибка', true);
}

async function deleteRelation(endpoint, id1, id2) {
    if (!confirm('Удалить связь?')) return;
    const resp = await fetch(`${API_BASE}/${endpoint}/${id1}/${id2}`, { method: 'DELETE' });
    if (resp.ok) {
        if (endpoint === 'ArtistConcerts') loadArtistConcert();
        else if (endpoint === 'ArtistMerch') loadArtistMerch();
        else if (endpoint === 'ProductGenres') loadProductGenre();
        showMessage(endpoint.substring(0, 2).toLowerCase(), 'Связь удалена', false);
    } else showMessage(endpoint.substring(0, 2).toLowerCase(), 'Ошибка удаления', true);
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
        if (btn.dataset.tab === 'artist-concert') loadArtistConcert();
        else if (btn.dataset.tab === 'artist-merch') loadArtistMerch();
        else if (btn.dataset.tab === 'product-genre') loadProductGenre();
    });
});

loadSelect(`${API_BASE}/Artists`, 'ac-artist-id', 'name', 'artistId');
loadSelect(`${API_BASE}/Concerts`, 'ac-concert-id', 'title', 'concertId');
loadSelect(`${API_BASE}/Artists`, 'am-artist-id', 'name', 'artistId');
loadSelect(`${API_BASE}/Merch`, 'am-merch-id', 'merchId', 'merchId');
loadSelect(`${API_BASE}/Products`, 'pg-product-id', 'name', 'productId');
loadSelect(`${API_BASE}/Genres`, 'pg-genre-id', 'name', 'genreId');

loadArtistConcert();