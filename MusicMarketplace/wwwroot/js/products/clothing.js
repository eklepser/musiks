let clothingEditId = null;
let selectedArtistsForClothing = [];

// Вспомогательная функция для преобразования artistIds в массив
function ensureArtistIdsArray(artistIds) {
    if (Array.isArray(artistIds)) return artistIds;
    if (typeof artistIds === 'string') {
        try {
            const parsed = JSON.parse(artistIds);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    if (artistIds === null || artistIds === undefined) return [];
    return [artistIds];
}

function renderClothingSelectedArtists() {
    const container = document.getElementById('clothing-selected-artists-list');
    if (!container) return;
    if (!selectedArtistsForClothing.length) {
        container.innerHTML = '<span style="color: #999;">Исполнители не выбраны</span>';
        return;
    }
    const names = selectedArtistsForClothing.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderEditClothingSelectedArtists() {
    const container = document.getElementById('edit-clothing-selected-artists-list');
    if (!container) return;
    if (!selectedArtistsForClothing.length) {
        container.innerHTML = '<span style="color: #999;">Исполнители не выбраны</span>';
        return;
    }
    const names = selectedArtistsForClothing.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function clearClothingForm() {
    document.getElementById('clothing-name').value = '';
    document.getElementById('clothing-price').value = '';
    document.getElementById('clothing-description').value = '';
    document.getElementById('clothing-stock').value = '';
    document.getElementById('clothing-manufacturer-id').value = '';
    document.getElementById('clothing-material').value = '';
    document.getElementById('clothing-color').value = '';
    document.getElementById('clothing-size').value = 'M';
    document.getElementById('clothing-gender').value = 'unisex';
    document.getElementById('clothing-edit-id').value = '';
    clothingEditId = null;
    selectedArtistsForClothing = [];
    renderClothingSelectedArtists();
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
}

function fillEditClothingForm(c) {
    hideEditPanel();
    document.getElementById('edit-clothing-id').value = c.clothing_id;
    document.getElementById('edit-clothing-name').value = c.name;
    document.getElementById('edit-clothing-price').value = c.price;
    document.getElementById('edit-clothing-description').value = c.description || '';
    document.getElementById('edit-clothing-stock').value = c.stock;
    document.getElementById('edit-clothing-manufacturer-id').value = c.manufacturer_id || '';
    document.getElementById('edit-clothing-material').value = c.material || '';
    document.getElementById('edit-clothing-color').value = c.color || '';
    document.getElementById('edit-clothing-size').value = c.size || 'M';
    document.getElementById('edit-clothing-gender').value = c.gender || 'unisex';
    document.getElementById('edit-clothing-form').style.display = 'block';
    // Преобразуем artistIds в массив
    selectedArtistsForClothing = ensureArtistIdsArray(c.artistIds);
    renderEditClothingSelectedArtists();
}

async function saveEditClothing() {
    const id = document.getElementById('edit-clothing-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-clothing-manufacturer-id').value);
    if (!manufacturerId) {
        showToast('Выберите производителя', 'error');
        return;
    }
    const name = document.getElementById('edit-clothing-name').value.trim();
    const price = parseFloat(document.getElementById('edit-clothing-price').value);
    if (isNaN(price) || price <= 0) {
        showToast('Цена должна быть положительным числом', 'error');
        return;
    }
    const data = {
        clothing_id: parseInt(id),
        name: name,
        price: price,
        description: document.getElementById('edit-clothing-description').value.trim(),
        stock: parseInt(document.getElementById('edit-clothing-stock').value) || 0,
        manufacturer_id: manufacturerId,
        material: document.getElementById('edit-clothing-material').value.trim(),
        color: document.getElementById('edit-clothing-color').value.trim(),
        size: document.getElementById('edit-clothing-size').value,
        gender: document.getElementById('edit-clothing-gender').value,
        artistIds: selectedArtistsForClothing  // уже массив
    };
    if (!data.name) {
        showToast('Заполните название', 'error');
        return;
    }
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
            return;
        }
        if (!resp.ok) {
            let errorMsg = 'Ошибка обновления';
            try {
                const text = await resp.text();
                if (text) errorMsg = text;
            } catch (e) { }
            showToast(errorMsg, 'error');
            return;
        }
        await loadAllItems();
        hideEditPanel();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

async function saveClothing() {
    const errorMsg = validateClothing();
    if (errorMsg) { showToast(errorMsg, 'error'); return; }
    const id = document.getElementById('clothing-edit-id').value;
    const name = document.getElementById('clothing-name').value.trim();
    const data = {
        name: name,
        price: parseFloat(document.getElementById('clothing-price').value),
        description: document.getElementById('clothing-description').value.trim(),
        stock: parseInt(document.getElementById('clothing-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('clothing-manufacturer-id').value) || null,
        material: document.getElementById('clothing-material').value.trim(),
        color: document.getElementById('clothing-color').value.trim(),
        size: document.getElementById('clothing-size').value,
        gender: document.getElementById('clothing-gender').value,
        artistIds: selectedArtistsForClothing
    };
    let url = CLOTHINGS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.clothing_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
            return;
        }
        if (!resp.ok) {
            let errorMsg = 'Ошибка сохранения';
            try {
                const text = await resp.text();
                if (text) errorMsg = text;
            } catch (e) { }
            showToast(errorMsg, 'error');
            return;
        }
        let newId = id;
        if (!id) {
            const result = await resp.json();
            newId = result.clothing_id;
            clearClothingForm();
            await loadAllItems();
            showToast(`Запись «${name}» (ID ${newId}) добавлена`, 'success');
            return;
        }
        clearClothingForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteClothing(id, name) {
    if (!confirm(`Удалить одежду «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

function openClothingArtistsModal() {
    const modal = document.getElementById('artists-merch-modal');
    const artistsListDiv = document.getElementById('modal-merch-artists-list');
    const artistSelect = document.getElementById('modal-merch-artist-select');
    if (!modal || !artistsListDiv || !artistSelect) return;

    artistsListDiv.innerHTML = '';
    if (selectedArtistsForClothing.length === 0) {
        artistsListDiv.innerHTML = '<p>Нет выбранных исполнителей</p>';
    } else {
        selectedArtistsForClothing.forEach(artistId => {
            const artist = allArtists.find(a => a.artist_id === artistId);
            const name = artist ? artist.name : `ID ${artistId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-clothing-artist-from-modal" data-artist-id="${artistId}">Удалить</button>`;
            artistsListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-clothing-artist-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.artistId);
                selectedArtistsForClothing = selectedArtistsForClothing.filter(aid => aid !== id);
                renderClothingSelectedArtists();
                renderEditClothingSelectedArtists();
                openClothingArtistsModal();
            });
        });
    }
    const availableArtists = allArtists.filter(a => !selectedArtistsForClothing.includes(a.artist_id));
    artistSelect.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
    availableArtists.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        artistSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function addClothingArtistFromModal() {
    const artistId = parseInt(document.getElementById('modal-merch-artist-select').value);
    if (!artistId) return;
    if (!selectedArtistsForClothing.includes(artistId)) {
        selectedArtistsForClothing.push(artistId);
        renderClothingSelectedArtists();
        renderEditClothingSelectedArtists();
        openClothingArtistsModal();
    } else {
        showToast('Исполнитель уже выбран', 'warning');
    }
}

function closeArtistsMerchModal() {
    const modal = document.getElementById('artists-merch-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('modal-merch-add-artist')?.addEventListener('click', addClothingArtistFromModal);
document.getElementById('modal-merch-close')?.addEventListener('click', closeArtistsMerchModal);
window.addEventListener('click', (e) => {
    const modal = document.getElementById('artists-merch-modal');
    if (e.target === modal && modal) modal.style.display = 'none';
});