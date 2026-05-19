function validateTicket() {
    const name = document.getElementById('ticket-name').value.trim();
    const price = parseFloat(document.getElementById('ticket-price').value);
    const concertId = document.getElementById('ticket-concert-id').value;
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    if (!concertId) return 'Выберите концерт.';
    return null;
}

function validateClothing() {
    const name = document.getElementById('clothing-name').value.trim();
    const price = parseFloat(document.getElementById('clothing-price').value);
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    const manufacturerId = document.getElementById('clothing-manufacturer-id').value;
    if (!manufacturerId) return 'Выберите производителя.';
    const stock = document.getElementById('clothing-stock').value;
    if (stock && parseInt(stock) < 0) return 'Остаток не может быть отрицательным.';
    return null;
}

function validateAccessory() {
    const name = document.getElementById('accessory-name').value.trim();
    const price = parseFloat(document.getElementById('accessory-price').value);
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    const manufacturerId = document.getElementById('accessory-manufacturer-id').value;
    if (!manufacturerId) return 'Выберите производителя.';
    const weight = document.getElementById('accessory-weight').value;
    if (weight && parseFloat(weight) < 0) return 'Вес не может быть отрицательным.';
    return null;
}

async function loadAllItems() {
    try {
        const [ticketsRes, clothingsRes, accessoriesRes] = await Promise.all([
            fetch(TICKETS_URL),
            fetch(CLOTHINGS_URL),
            fetch(ACCESSORIES_URL)
        ]);
        const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
        const clothings = clothingsRes.ok ? await clothingsRes.json() : [];
        const accessories = accessoriesRes.ok ? await accessoriesRes.json() : [];
        allProducts = [
            ...tickets.map(t => ({ ...t, type: 'ticket', typeName: 'Билет', product_id: t.ticket_id })),
            ...clothings.map(c => ({ ...c, type: 'clothing', typeName: 'Одежда', product_id: c.clothing_id })),
            ...accessories.map(a => ({ ...a, type: 'accessory', typeName: 'Аксессуар', product_id: a.accessory_id }))
        ];
        renderCatalog();
    } catch (err) {
        document.getElementById('catalog-tbody').innerHTML = '<td><td colspan="8">Ошибка загрузки</td></tr>';
    }
}

function renderCatalog() {
    const searchName = document.getElementById('search-name').value.trim().toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    const filterManufacturerId = document.getElementById('filter-manufacturer').value;
    const selectedGenres = getSelectedGenres();

    let filtered = allProducts.filter(p => {
        if (searchName && !p.name.toLowerCase().includes(searchName)) return false;
        if (filterType && p.type !== filterType) return false;
        if (filterManufacturerId && p.manufacturer_id != filterManufacturerId) return false;
        if (selectedGenres.length > 0) {
            const productGenresList = productGenres[p.product_id] || [];
            if (!selectedGenres.some(g => productGenresList.includes(g))) return false;
        }
        return true;
    });

    document.getElementById('found-count').innerText = filtered.length;
    const tbody = document.getElementById('catalog-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Нет данных</td></tr>';
        return;
    }
    filtered.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.ticket_id || item.clothing_id || item.accessory_id;
        row.insertCell(1).textContent = item.typeName;
        row.insertCell(2).textContent = item.name;
        row.insertCell(3).textContent = item.price;
        row.insertCell(4).textContent = item.stock;
        row.insertCell(5).textContent = getManufacturerName(item.manufacturer_id);
        let extra = '';
        if (item.type === 'ticket') {
            extra = `Концерт: ${item.concert_title || item.concert_id}, Место: ${item.seat_row || ''} ${item.seat_number || ''}, Категория: ${item.price_category || ''}`;
        } else if (item.type === 'clothing') {
            extra = `Материал: ${item.material || '-'}, Цвет: ${item.color || '-'}, Размер: ${item.size || '-'}, Пол: ${item.gender || '-'}`;
        } else if (item.type === 'accessory') {
            extra = `Материал: ${item.material || '-'}, Цвет: ${item.color || '-'}, Тип: ${item.accessory_type || '-'}, Вес: ${item.weight || '-'}г`;
        }
        row.insertCell(6).textContent = extra;
        const actions = row.insertCell(7);
        const topRow = document.createElement('div');
        topRow.className = 'action-buttons-row';
        const bottomRow = document.createElement('div');
        bottomRow.className = 'action-buttons-row';
        const wishBtn = document.createElement('button');
        wishBtn.textContent = '❤️';
        wishBtn.title = 'В вишлист';
        wishBtn.style.background = '#ffc107';
        wishBtn.style.marginRight = '5px';
        wishBtn.onclick = () => showToast('Функция "В вишлист" в разработке', 'info');
        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = '✍️';
        reviewBtn.title = 'Оставить отзыв';
        reviewBtn.style.background = '#17a2b8';
        reviewBtn.style.marginRight = '5px';
        reviewBtn.onclick = () => showToast('Функция "Отзыв" в разработке', 'info');
        const cartBtn = document.createElement('button');
        cartBtn.textContent = '🛒';
        cartBtn.title = 'В корзину';
        cartBtn.style.background = '#28a745';
        cartBtn.style.marginRight = '5px';
        cartBtn.onclick = () => showToast('Функция "В корзину" в разработке', 'info');
        topRow.append(wishBtn, reviewBtn, cartBtn);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.className = 'edit-btn';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => {
            if (item.type === 'ticket') fillEditTicketForm(item);
            else if (item.type === 'clothing') fillEditClothingForm(item);
            else if (item.type === 'accessory') fillEditAccessoryForm(item);
            document.getElementById('edit-panel').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => {
            if (item.type === 'ticket') deleteTicket(item.ticket_id, item.name);
            else if (item.type === 'clothing') deleteClothing(item.clothing_id, item.name);
            else if (item.type === 'accessory') deleteAccessory(item.accessory_id, item.name);
        };
        bottomRow.append(editBtn, delBtn);
        actions.append(topRow, bottomRow);
    });
}

function refreshCatalogFilters() {
    loadManufacturersForSelect('filter-manufacturer');
    renderCatalog();
}

function hideEditPanel() {
    document.getElementById('edit-panel').style.display = 'none';
    document.getElementById('edit-ticket-form').style.display = 'none';
    document.getElementById('edit-clothing-form').style.display = 'none';
    document.getElementById('edit-accessory-form').style.display = 'none';
}

function fillEditTicketForm(t) {
    hideEditPanel();
    document.getElementById('edit-ticket-id').value = t.ticket_id;
    document.getElementById('edit-ticket-name').value = t.name;
    document.getElementById('edit-ticket-price').value = t.price;
    document.getElementById('edit-ticket-description').value = t.description || '';
    document.getElementById('edit-ticket-stock').value = t.stock;
    document.getElementById('edit-ticket-manufacturer-id').value = t.manufacturer_id || '';
    document.getElementById('edit-ticket-concert-id').value = t.concert_id;
    document.getElementById('edit-ticket-seat-row').value = t.seat_row || '';
    document.getElementById('edit-ticket-seat-number').value = t.seat_number || '';
    document.getElementById('edit-ticket-price-category').value = t.price_category || '';
    document.getElementById('edit-ticket-form').style.display = 'block';
    const artistsBtn = document.getElementById('edit-ticket-artists-btn');
    if (artistsBtn) artistsBtn.setAttribute('data-product-id', t.ticket_id);
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
    const artistsBtn = document.getElementById('edit-clothing-artists-btn');
    if (artistsBtn) artistsBtn.setAttribute('data-product-id', c.clothing_id);
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
    const artistsBtn = document.getElementById('edit-accessory-artists-btn');
    if (artistsBtn) artistsBtn.setAttribute('data-product-id', a.accessory_id);
}

async function saveEditTicket() {
    const id = document.getElementById('edit-ticket-id').value;
    const name = document.getElementById('edit-ticket-name').value.trim();
    const data = {
        ticket_id: parseInt(id),
        name: name,
        price: parseFloat(document.getElementById('edit-ticket-price').value),
        description: document.getElementById('edit-ticket-description').value.trim(),
        stock: parseInt(document.getElementById('edit-ticket-stock').value) || 0,
        concert_id: parseInt(document.getElementById('edit-ticket-concert-id').value),
        seat_row: document.getElementById('edit-ticket-seat-row').value.trim(),
        seat_number: document.getElementById('edit-ticket-seat-number').value.trim(),
        price_category: document.getElementById('edit-ticket-price-category').value.trim(),
        manufacturer_id: parseInt(document.getElementById('edit-ticket-manufacturer-id').value) || null
    };
    if (!data.name || isNaN(data.price) || !data.concert_id) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой билет уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка обновления', 'error');
    }
}

async function saveEditClothing() {
    const id = document.getElementById('edit-clothing-id').value;
    const name = document.getElementById('edit-clothing-name').value.trim();
    const data = {
        clothing_id: parseInt(id),
        name: name,
        price: parseFloat(document.getElementById('edit-clothing-price').value),
        description: document.getElementById('edit-clothing-description').value.trim(),
        stock: parseInt(document.getElementById('edit-clothing-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('edit-clothing-manufacturer-id').value) || null,
        material: document.getElementById('edit-clothing-material').value.trim(),
        color: document.getElementById('edit-clothing-color').value.trim(),
        size: document.getElementById('edit-clothing-size').value,
        gender: document.getElementById('edit-clothing-gender').value
    };
    if (!data.name || isNaN(data.price)) {
        showToast('Заполните название и цену', 'error');
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка обновления', 'error');
    }
}

async function saveEditAccessory() {
    const id = document.getElementById('edit-accessory-id').value;
    const name = document.getElementById('edit-accessory-name').value.trim();
    const data = {
        accessory_id: parseInt(id),
        name: name,
        price: parseFloat(document.getElementById('edit-accessory-price').value),
        description: document.getElementById('edit-accessory-description').value.trim(),
        stock: parseInt(document.getElementById('edit-accessory-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('edit-accessory-manufacturer-id').value) || null,
        material: document.getElementById('edit-accessory-material').value.trim(),
        color: document.getElementById('edit-accessory-color').value.trim(),
        accessory_type: document.getElementById('edit-accessory-type').value.trim(),
        weight: parseFloat(document.getElementById('edit-accessory-weight').value) || null
    };
    if (!data.name || isNaN(data.price)) {
        showToast('Заполните название и цену', 'error');
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка обновления', 'error');
    }
}

async function deleteTicket(id, name) {
    if (!confirm(`Удалить билет «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
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

async function deleteAccessory(id, name) {
    if (!confirm(`Удалить аксессуар «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

async function loadProductArtists(productId) {
    const resp = await fetch(`${PRODUCT_ARTISTS_URL}/byProduct/${productId}`);
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
    const data = { product_id: currentProductIdForArtist, artist_id: artistId };
    try {
        const resp = await fetch(PRODUCT_ARTISTS_URL, {
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
        const resp = await fetch(`${PRODUCT_ARTISTS_URL}/${currentProductIdForArtist}/${artistId}`, { method: 'DELETE' });
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

let currentProductIdForArtist = null;

document.getElementById('edit-ticket-artists-btn')?.addEventListener('click', () => {
    const pid = document.getElementById('edit-ticket-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('edit-clothing-artists-btn')?.addEventListener('click', () => {
    const pid = document.getElementById('edit-clothing-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('edit-accessory-artists-btn')?.addEventListener('click', () => {
    const pid = document.getElementById('edit-accessory-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('product-artist-add')?.addEventListener('click', addProductArtist);
document.getElementById('product-artist-close')?.addEventListener('click', () => {
    document.getElementById('product-artists-modal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    const modal = document.getElementById('product-artists-modal');
    if (e.target === modal) modal.style.display = 'none';
});