let currentProductIdForArtist = null;

async function loadProductArtists(productId) {
    const resp = await fetch(`${ARTIST_MERCH_URL}/byMerch/${productId}`);
    if (resp.ok) return await resp.json();
    return [];
}

async function loadAllArtists() {
    const resp = await fetch(ARTISTS_URL);
    if (resp.ok) {
        allArtists = await resp.json();
        return allArtists;
    }
    return [];
}

async function openProductArtistsModal(productId) {
    currentProductIdForArtist = productId;
    const modal = document.getElementById('product-artists-modal');
    const listDiv = document.getElementById('product-artists-list');
    const select = document.getElementById('product-artist-select');
    const existingLinks = await loadProductArtists(productId);
    const existingIds = existingLinks.map(link => link.artist_id);
    const allArtists = await loadAllArtists();

    listDiv.innerHTML = '';
    if (existingIds.length === 0) {
        listDiv.innerHTML = '<p>Нет исполнителей</p>';
    } else {
        existingIds.forEach(id => {
            const artist = allArtists.find(a => a.artist_id === id);
            const name = artist ? artist.name : `ID ${id}`;
            const div = document.createElement('div');
            div.innerHTML = `${name} <button class="remove-product-artist-btn" data-artist-id="${id}">Удалить</button>`;
            listDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-product-artist-btn').forEach(btn => {
            btn.onclick = () => removeProductArtist(parseInt(btn.dataset.artistId));
        });
    }

    const available = allArtists.filter(a => !existingIds.includes(a.artist_id));
    select.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
    available.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        select.appendChild(opt);
    });

    modal.style.display = 'block';
}

async function addProductArtist() {
    const artistId = parseInt(document.getElementById('product-artist-select').value);
    if (!artistId) return;
    const data = { artist_id: artistId, merch_id: currentProductIdForArtist };
    try {
        const resp = await fetch(ARTIST_MERCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            await openProductArtistsModal(currentProductIdForArtist);
            showToast('Исполнитель добавлен', 'success');
        } else {
            showToast('Ошибка добавления', 'error');
        }
    } catch (err) {
        showToast('Ошибка сети', 'error');
    }
}

async function removeProductArtist(artistId) {
    try {
        const resp = await fetch(`${ARTIST_MERCH_URL}/${currentProductIdForArtist}/${artistId}`, { method: 'DELETE' });
        if (resp.ok) {
            await openProductArtistsModal(currentProductIdForArtist);
            showToast('Исполнитель удалён', 'success');
        } else {
            showToast('Ошибка удаления', 'error');
        }
    } catch (err) {
        showToast('Ошибка сети', 'error');
    }
}