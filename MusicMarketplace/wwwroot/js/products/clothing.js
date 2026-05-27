let clothingEditId = null;
let selectedArtistsForClothing = [];

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
        container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
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
        container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
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
    document.getElementById('clothing-stock').value = '0';
    document.getElementById('clothing-manufacturer-id').value = '';
    document.getElementById('clothing-material').value = '';
    document.getElementById('clothing-color').value = '';
    document.getElementById('clothing-size').value = 'M';
    document.getElementById('clothing-gender').value = 'unisex';
    document.getElementById('clothing-edit-id').value = '';
    clothingEditId = null;
    selectedArtistsForClothing = [];
    window.selectedGenresForClothing = [];
    if (typeof renderClothingSelectedArtists === 'function') renderClothingSelectedArtists();
    if (typeof renderClothingSelectedGenres === 'function') renderClothingSelectedGenres();
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
    const fields = ['clothing-name', 'clothing-price', 'clothing-stock', 'clothing-manufacturer-id', 'clothing-material', 'clothing-color', 'clothing-description'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && typeof clearFieldValidity === 'function') clearFieldValidity(el);
    });
}

function initClothingLiveValidation() {
    const fields = [
        { id: 'clothing-name', required: true, validator: (v) => validateRequiredString(v, 'Название', 2, 200, true) },
        { id: 'clothing-price', required: true, validator: (v) => validatePrice(v, true) },
        { id: 'clothing-stock', required: false, validator: (v) => validateStock(v, false) },
        { id: 'clothing-manufacturer-id', required: true, validator: (v) => v ? null : 'Выберите производителя' },
        { id: 'clothing-material', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Материал', 50) : null },
        { id: 'clothing-color', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Цвет', 30) : null },
        { id: 'clothing-description', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Описание', 1000) : null }
    ];
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && typeof attachLiveValidation === 'function') {
            attachLiveValidation(el, f.validator, f.required);
        }
    });
}

function initEditClothingLiveValidation() {
    const fields = [
        { id: 'edit-clothing-name', required: true, validator: (v) => validateRequiredString(v, 'Название', 2, 200, true) },
        { id: 'edit-clothing-price', required: true, validator: (v) => validatePrice(v, true) },
        { id: 'edit-clothing-stock', required: false, validator: (v) => validateStock(v, false) },
        { id: 'edit-clothing-manufacturer-id', required: true, validator: (v) => v ? null : 'Выберите производителя' },
        { id: 'edit-clothing-material', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Материал', 50) : null },
        { id: 'edit-clothing-color', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Цвет', 30) : null },
        { id: 'edit-clothing-description', required: false, validator: (v) => v && v.trim() ? validateOptionalString(v, 'Описание', 1000) : null }
    ];
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && typeof attachLiveValidation === 'function') {
            attachLiveValidation(el, f.validator, f.required);
        }
    });
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
    selectedArtistsForClothing = ensureArtistIdsArray(c.artistIds);
    window.selectedGenresForClothing = c.genreIds || [];
    if (typeof renderEditClothingSelectedArtists === 'function') renderEditClothingSelectedArtists();
    if (typeof renderEditClothingSelectedGenres === 'function') renderEditClothingSelectedGenres();
    loadProductGenresForEdit(c.product_id, 'clothing');
    initEditClothingLiveValidation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateClothingFields(name, price, stock, manufacturerId, material, color, description) {
    let err = validateRequiredString(name, 'Название', 2, 200, true);
    if (err) return err;
    err = validatePrice(price, true);
    if (err) return err;
    err = validateStock(stock, false);
    if (err) return err;
    if (!manufacturerId) return 'Выберите производителя';
    if (material && material.trim()) {
        err = validateOptionalString(material, 'Материал', 50);
        if (err) return err;
    }
    if (color && color.trim()) {
        err = validateOptionalString(color, 'Цвет', 30);
        if (err) return err;
    }
    if (description && description.trim()) {
        err = validateOptionalString(description, 'Описание', 1000);
        if (err) return err;
    }
    return null;
}

async function saveEditClothing() {
    const id = document.getElementById('edit-clothing-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-clothing-manufacturer-id').value);
    const name = document.getElementById('edit-clothing-name').value.trim();
    const price = document.getElementById('edit-clothing-price').value;
    const stock = document.getElementById('edit-clothing-stock').value;
    const material = document.getElementById('edit-clothing-material').value.trim();
    const color = document.getElementById('edit-clothing-color').value.trim();
    const description = document.getElementById('edit-clothing-description').value.trim();
    const validationError = validateClothingFields(name, price, stock, manufacturerId, material, color, description);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    if (!manufacturerId) { showToast('Выберите производителя', 'error'); return; }
    const data = {
        clothing_id: parseInt(id),
        name: name,
        price: parseFloat(price),
        description: description || null,
        stock: parseInt(stock, 10) || 0,
        manufacturer_id: manufacturerId,
        material: material || null,
        color: color || null,
        size: document.getElementById('edit-clothing-size').value,
        gender: document.getElementById('edit-clothing-gender').value,
        artistIds: selectedArtistsForClothing,
        genreIds: window.selectedGenresForClothing
    };
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const error = await resp.json();
            showToast(error.message || 'Такая одежда уже существует', 'error');
            return;
        }
        if (resp.status === 400 || resp.status === 422) {
            showToast('Ошибка валидации данных', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        hideEditPanel();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

async function saveClothing() {
    const name = document.getElementById('clothing-name').value.trim();
    const price = document.getElementById('clothing-price').value;
    const stock = document.getElementById('clothing-stock').value;
    const manufacturerId = document.getElementById('clothing-manufacturer-id').value;
    const material = document.getElementById('clothing-material').value.trim();
    const color = document.getElementById('clothing-color').value.trim();
    const description = document.getElementById('clothing-description').value.trim();
    const validationError = validateClothingFields(name, price, stock, manufacturerId, material, color, description);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    if (!manufacturerId) { showToast('Выберите производителя', 'error'); return; }
    const id = document.getElementById('clothing-edit-id').value;
    const data = {
        name: name,
        price: parseFloat(price),
        description: description || null,
        stock: parseInt(stock, 10) || 0,
        manufacturer_id: parseInt(manufacturerId),
        material: material || null,
        color: color || null,
        size: document.getElementById('clothing-size').value,
        gender: document.getElementById('clothing-gender').value,
        artistIds: selectedArtistsForClothing,
        genreIds: window.selectedGenresForClothing
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
            const error = await resp.json();
            showToast(error.message || 'Такая одежда уже существует', 'error');
            return;
        }
        if (resp.status === 400 || resp.status === 422) {
            showToast('Ошибка валидации данных', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
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
    const confirmed = await showConfirmModal({
        title: 'Удаление одежды',
        message: `Удалить одежду «${name}» (ID ${id})?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
        if (resp.status === 409) {
            const error = await resp.json();
            showToast(error.message || 'Невозможно удалить товар, который есть в заказах', 'error');
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
            div.className = 'selected-artist-item';
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

initClothingLiveValidation();