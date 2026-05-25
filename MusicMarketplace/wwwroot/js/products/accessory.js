let accessoryEditId = null;
let selectedArtistsForAccessory = [];

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

function renderAccessorySelectedArtists() {
    const container = document.getElementById('accessory-selected-artists-list');
    if (!container) return;
    if (!selectedArtistsForAccessory.length) {
        container.innerHTML = '<span style="color: #999;">Исполнители не выбраны</span>';
        return;
    }
    const names = selectedArtistsForAccessory.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderEditAccessorySelectedArtists() {
    const container = document.getElementById('edit-accessory-selected-artists-list');
    if (!container) return;
    if (!selectedArtistsForAccessory.length) {
        container.innerHTML = '<span style="color: #999;">Исполнители не выбраны</span>';
        return;
    }
    const names = selectedArtistsForAccessory.map(id => {
        const artist = allArtists.find(a => a.artist_id === id);
        return artist ? artist.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function clearAccessoryForm() {
    document.getElementById('accessory-name').value = '';
    document.getElementById('accessory-price').value = '';
    document.getElementById('accessory-description').value = '';
    document.getElementById('accessory-stock').value = '';
    document.getElementById('accessory-manufacturer-id').value = '';
    document.getElementById('accessory-material').value = '';
    document.getElementById('accessory-color').value = '';
    document.getElementById('accessory-type').value = '';
    document.getElementById('accessory-weight').value = '';
    document.getElementById('accessory-edit-id').value = '';
    accessoryEditId = null;
    selectedArtistsForAccessory = [];
    renderAccessorySelectedArtists();
    document.getElementById('accessory-submit').innerText = 'Добавить';
    document.getElementById('accessory-cancel').style.display = 'none';
}

function fillEditAccessoryForm(a) {
    hideEditPanel();
    document.getElementById('edit-accessory-id').value = a.accessory_id;
    document.getElementById('edit-accessory-name').value = a.name;
    document.getElementById('edit-accessory-price').value = a.price;
    document.getElementById('edit-accessory-description').value = a.description || '';
    document.getElementById('edit-accessory-stock').value = a.stock;
    document.getElementById('edit-accessory-manufacturer-id').value = a.manufacturer_id || '';
    document.getElementById('edit-accessory-material').value = a.material || '';
    document.getElementById('edit-accessory-color').value = a.color || '';
    document.getElementById('edit-accessory-type').value = a.accessory_type || '';
    document.getElementById('edit-accessory-weight').value = a.weight || '';
    document.getElementById('edit-accessory-form').style.display = 'block';
    selectedArtistsForAccessory = ensureArtistIdsArray(a.artistIds);
    renderEditAccessorySelectedArtists();
}

async function saveEditAccessory() {
    const id = document.getElementById('edit-accessory-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-accessory-manufacturer-id').value);
    if (!manufacturerId) {
        showToast('Выберите производителя', 'error');
        return;
    }
    const name = document.getElementById('edit-accessory-name').value.trim();
    const price = parseFloat(document.getElementById('edit-accessory-price').value);
    if (isNaN(price) || price <= 0) {
        showToast('Цена должна быть положительным числом', 'error');
        return;
    }
    const data = {
        accessory_id: parseInt(id),
        name: name,
        price: price,
        description: document.getElementById('edit-accessory-description').value.trim(),
        stock: parseInt(document.getElementById('edit-accessory-stock').value) || 0,
        manufacturer_id: manufacturerId,
        material: document.getElementById('edit-accessory-material').value.trim(),
        color: document.getElementById('edit-accessory-color').value.trim(),
        accessory_type: document.getElementById('edit-accessory-type').value.trim(),
        weight: parseFloat(document.getElementById('edit-accessory-weight').value) || null,
        artistIds: selectedArtistsForAccessory
    };
    if (!data.name) {
        showToast('Заполните название', 'error');
        return;
    }
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой аксессуар уже существует', 'error');
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

async function saveAccessory() {
    const errorMsg = validateAccessory();
    if (errorMsg) { showToast(errorMsg, 'error'); return; }
    const id = document.getElementById('accessory-edit-id').value;
    const name = document.getElementById('accessory-name').value.trim();
    const data = {
        name: name,
        price: parseFloat(document.getElementById('accessory-price').value),
        description: document.getElementById('accessory-description').value.trim(),
        stock: parseInt(document.getElementById('accessory-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('accessory-manufacturer-id').value) || null,
        material: document.getElementById('accessory-material').value.trim(),
        color: document.getElementById('accessory-color').value.trim(),
        accessory_type: document.getElementById('accessory-type').value.trim(),
        weight: parseFloat(document.getElementById('accessory-weight').value) || null,
        artistIds: selectedArtistsForAccessory
    };
    let url = ACCESSORIES_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.accessory_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой аксессуар уже существует', 'error');
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
            newId = result.accessory_id;
            clearAccessoryForm();
            await loadAllItems();
            showToast(`Запись «${name}» (ID ${newId}) добавлена`, 'success');
            return;
        }
        clearAccessoryForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteAccessory(id, name) {
    if (!confirm(`Удалить аксессуар «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
        if (resp.status === 409) {
            const errorMessage = await resp.text();
            showToast(errorMessage || 'Невозможно удалить товар, который есть в заказах', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        hideEditPanel(); 
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

function openAccessoryArtistsModal() {
    const modal = document.getElementById('artists-merch-modal');
    const artistsListDiv = document.getElementById('modal-merch-artists-list');
    const artistSelect = document.getElementById('modal-merch-artist-select');
    if (!modal || !artistsListDiv || !artistSelect) return;

    artistsListDiv.innerHTML = '';
    if (selectedArtistsForAccessory.length === 0) {
        artistsListDiv.innerHTML = '<p>Нет выбранных исполнителей</p>';
    } else {
        selectedArtistsForAccessory.forEach(artistId => {
            const artist = allArtists.find(a => a.artist_id === artistId);
            const name = artist ? artist.name : `ID ${artistId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-accessory-artist-from-modal" data-artist-id="${artistId}">Удалить</button>`;
            artistsListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-accessory-artist-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.artistId);
                selectedArtistsForAccessory = selectedArtistsForAccessory.filter(aid => aid !== id);
                renderAccessorySelectedArtists();
                renderEditAccessorySelectedArtists();
                openAccessoryArtistsModal();
            });
        });
    }
    const availableArtists = allArtists.filter(a => !selectedArtistsForAccessory.includes(a.artist_id));
    artistSelect.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
    availableArtists.forEach(artist => {
        const opt = document.createElement('option');
        opt.value = artist.artist_id;
        opt.textContent = artist.name;
        artistSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function addAccessoryArtistFromModal() {
    const artistId = parseInt(document.getElementById('modal-merch-artist-select').value);
    if (!artistId) return;
    if (!selectedArtistsForAccessory.includes(artistId)) {
        selectedArtistsForAccessory.push(artistId);
        renderAccessorySelectedArtists();
        renderEditAccessorySelectedArtists();
        openAccessoryArtistsModal();
    } else {
        showToast('Исполнитель уже выбран', 'warning');
    }
}

function closeArtistsMerchModal() {
    const modal = document.getElementById('artists-merch-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('modal-merch-add-artist')?.addEventListener('click', addAccessoryArtistFromModal);
document.getElementById('modal-merch-close')?.addEventListener('click', closeArtistsMerchModal);
window.addEventListener('click', (e) => {
    const modal = document.getElementById('artists-merch-modal');
    if (e.target === modal && modal) modal.style.display = 'none';
});