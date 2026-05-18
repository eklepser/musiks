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
        document.getElementById('catalog-tbody').innerHTML = '<tr><td colspan="8">Ошибка загрузки';
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
        tbody.innerHTML = '<tr><td colspan="8">Нет данных</tr>';
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
            extra = `Концерт: ${item.concert_title || item.concert_id}, Место: ${item.seat_row || ''} ${item.seat_number || ''}, Кат: ${item.price_category || ''}`;
        } else if (item.type === 'clothing') {
            extra = `Материал: ${item.material || '-'}, Цвет: ${item.color || '-'}, Размер: ${item.size || '-'}, Пол: ${item.gender || '-'}`;
        } else if (item.type === 'accessory') {
            extra = `Материал: ${item.material || '-'}, Цвет: ${item.color || '-'}, Тип: ${item.accessory_type || '-'}, Вес: ${item.weight || '-'}г`;
        }
        row.insertCell(6).textContent = extra;
        const actions = row.insertCell(7);
        const wishBtn = document.createElement('button');
        wishBtn.textContent = '❤️';
        wishBtn.title = 'В вишлист';
        wishBtn.style.background = '#ffc107';
        wishBtn.style.marginRight = '5px';
        wishBtn.onclick = () => alert('Функция "В вишлист" в разработке');
        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = '✍️';
        reviewBtn.title = 'Оставить отзыв';
        reviewBtn.style.background = '#17a2b8';
        reviewBtn.style.marginRight = '5px';
        reviewBtn.onclick = () => alert('Функция "Отзыв" в разработке');
        const cartBtn = document.createElement('button');
        cartBtn.textContent = '🛒';
        cartBtn.title = 'В корзину';
        cartBtn.style.background = '#28a745';
        cartBtn.style.marginRight = '5px';
        cartBtn.onclick = () => alert('Функция "В корзину" в разработке');
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
        actions.append(wishBtn, reviewBtn, cartBtn, editBtn, delBtn);
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
        showMessage('edit-ticket', 'Заполните обязательные поля', true);
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
            showMessage('edit-ticket', text.includes('already') ? text : 'Такой билет уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        hideEditPanel();
        await loadAllItems();
        showMessage('edit-ticket', `Запись «${name}» (ID ${id}) обновлена`, false);
    } catch (err) {
        showMessage('edit-ticket', 'Ошибка обновления', true);
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
        showMessage('edit-clothing', 'Заполните название и цену', true);
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
            showMessage('edit-clothing', text.includes('already') ? text : 'Такая одежда уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        hideEditPanel();
        await loadAllItems();
        showMessage('edit-clothing', `Запись «${name}» (ID ${id}) обновлена`, false);
    } catch (err) {
        showMessage('edit-clothing', 'Ошибка обновления', true);
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
        showMessage('edit-accessory', 'Заполните название и цену', true);
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
            showMessage('edit-accessory', text.includes('already') ? text : 'Такой аксессуар уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        hideEditPanel();
        await loadAllItems();
        showMessage('edit-accessory', `Запись «${name}» (ID ${id}) обновлена`, false);
    } catch (err) {
        showMessage('edit-accessory', 'Ошибка обновления', true);
    }
}

async function deleteTicket(id, name) {
    if (!confirm(`Удалить билет «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showMessage('ticket', `Запись «${name}» (ID ${id}) удалена`, false);
    } catch (err) {
        showMessage('ticket', 'Ошибка удаления', true);
    }
}

async function deleteClothing(id, name) {
    if (!confirm(`Удалить одежду «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showMessage('clothing', `Запись «${name}» (ID ${id}) удалена`, false);
    } catch (err) {
        showMessage('clothing', 'Ошибка удаления', true);
    }
}

async function deleteAccessory(id, name) {
    if (!confirm(`Удалить аксессуар «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showMessage('accessory', `Запись «${name}» (ID ${id}) удалена`, false);
    } catch (err) {
        showMessage('accessory', 'Ошибка удаления', true);
    }
}

function clearTicketForm() {
    document.getElementById('ticket-name').value = '';
    document.getElementById('ticket-price').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-stock').value = '';
    document.getElementById('ticket-manufacturer-id').value = '';
    document.getElementById('ticket-concert-id').value = '';
    document.getElementById('ticket-seat-row').value = '';
    document.getElementById('ticket-seat-number').value = '';
    document.getElementById('ticket-price-category').value = '';
    document.getElementById('ticket-edit-id').value = '';
    ticketEditId = null;
    document.getElementById('ticket-submit').innerText = 'Добавить';
    document.getElementById('ticket-cancel').style.display = 'none';
}

async function saveTicket() {
    const errorMsg = validateTicket();
    if (errorMsg) { showMessage('ticket', errorMsg, true); return; }
    const id = document.getElementById('ticket-edit-id').value;
    const name = document.getElementById('ticket-name').value.trim();
    const data = {
        name: name,
        price: parseFloat(document.getElementById('ticket-price').value),
        description: document.getElementById('ticket-description').value.trim(),
        stock: parseInt(document.getElementById('ticket-stock').value) || 0,
        concert_id: parseInt(document.getElementById('ticket-concert-id').value),
        seat_row: document.getElementById('ticket-seat-row').value.trim(),
        seat_number: document.getElementById('ticket-seat-number').value.trim(),
        price_category: document.getElementById('ticket-price-category').value.trim(),
        manufacturer_id: parseInt(document.getElementById('ticket-manufacturer-id').value) || null
    };
    let url = TICKETS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.ticket_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showMessage('ticket', text.includes('already') ? text : 'Такой билет уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).ticket_id;
        clearTicketForm();
        await loadAllItems();
        showMessage('ticket', `Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, false);
    } catch (err) {
        showMessage('ticket', 'Ошибка сохранения', true);
    }
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
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
}

async function saveClothing() {
    const errorMsg = validateClothing();
    if (errorMsg) { showMessage('clothing', errorMsg, true); return; }
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
        gender: document.getElementById('clothing-gender').value
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
            showMessage('clothing', text.includes('already') ? text : 'Такая одежда уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).clothing_id;
        clearClothingForm();
        await loadAllItems();
        showMessage('clothing', `Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлена' : 'добавлена'}`, false);
    } catch (err) {
        showMessage('clothing', 'Ошибка сохранения', true);
    }
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
    document.getElementById('accessory-submit').innerText = 'Добавить';
    document.getElementById('accessory-cancel').style.display = 'none';
}

async function saveAccessory() {
    const errorMsg = validateAccessory();
    if (errorMsg) { showMessage('accessory', errorMsg, true); return; }
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
        weight: parseFloat(document.getElementById('accessory-weight').value) || null
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
            showMessage('accessory', text.includes('already') ? text : 'Такой аксессуар уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).accessory_id;
        clearAccessoryForm();
        await loadAllItems();
        showMessage('accessory', `Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, false);
    } catch (err) {
        showMessage('accessory', 'Ошибка сохранения', true);
    }
}

async function loadManufacturersTable() {
    try {
        const resp = await fetch(MANUFACTURERS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        items.sort((a, b) => a.manufacturer_id - b.manufacturer_id);
        const tbody = document.getElementById('manufacturers-tbody');
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Нет данных</tr>';
            return;
        }
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.manufacturer_id;
            row.insertCell(1).textContent = item.name;
            row.insertCell(2).textContent = item.contact_info || '';
            const actions = row.insertCell(3);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.style.marginRight = '5px';
            editBtn.onclick = () => fillManufacturerForm(item);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteManufacturer(item.manufacturer_id, item.name);
            actions.append(editBtn, delBtn);
        });
    } catch (err) {
        document.getElementById('manufacturers-tbody').innerHTML = '<tr><td colspan="4">Ошибка загрузки</tr>';
    }
}

function fillManufacturerForm(item) {
    document.getElementById('manufacturer-name').value = item.name;
    document.getElementById('manufacturer-contact').value = item.contact_info || '';
    document.getElementById('manufacturer-edit-id').value = item.manufacturer_id;
    manufacturerEditId = item.manufacturer_id;
    document.getElementById('manufacturer-form-title').innerText = 'Редактировать производителя';
    document.getElementById('manufacturer-submit').innerText = 'Сохранить';
    document.getElementById('manufacturer-cancel').style.display = 'inline-block';
}

function clearManufacturerForm() {
    document.getElementById('manufacturer-name').value = '';
    document.getElementById('manufacturer-contact').value = '';
    document.getElementById('manufacturer-edit-id').value = '';
    manufacturerEditId = null;
    document.getElementById('manufacturer-form-title').innerText = 'Добавить производителя';
    document.getElementById('manufacturer-submit').innerText = 'Добавить';
    document.getElementById('manufacturer-cancel').style.display = 'none';
}

async function saveManufacturer() {
    const id = document.getElementById('manufacturer-edit-id').value;
    const name = document.getElementById('manufacturer-name').value.trim();
    const data = {
        name: name,
        contact_info: document.getElementById('manufacturer-contact').value.trim() || null
    };
    if (!data.name) { showMessage('manufacturer', 'Название обязательно', true); return; }
    let url = MANUFACTURERS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.manufacturer_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showMessage('manufacturer', text.includes('already') ? text : 'Такой производитель уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).manufacturer_id;
        clearManufacturerForm();
        await loadManufacturersTable();
        await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
        await loadManufacturersForSelect('edit-ticket-manufacturer-id');
        await loadManufacturersForSelect('edit-clothing-manufacturer-id');
        await loadManufacturersForSelect('edit-accessory-manufacturer-id');
        showMessage('manufacturer', `Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, false);
    } catch (err) {
        showMessage('manufacturer', 'Ошибка сохранения', true);
    }
}

async function deleteManufacturer(id, name) {
    if (!confirm(`Удалить производителя «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${MANUFACTURERS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadManufacturersTable();
        await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
        await loadManufacturersForSelect('edit-ticket-manufacturer-id');
        await loadManufacturersForSelect('edit-clothing-manufacturer-id');
        await loadManufacturersForSelect('edit-accessory-manufacturer-id');
        showMessage('manufacturer', `Запись «${name}» (ID ${id}) удалена`, false);
    } catch (err) {
        showMessage('manufacturer', 'Ошибка удаления', true);
    }
}

async function loadGenresTable() {
    try {
        const resp = await fetch(GENRES_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        items.sort((a, b) => a.genre_id - b.genre_id);
        const tbody = document.getElementById('genres-tbody');
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<td><td colspan="4">Нет данных</tr>';
            return;
        }
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.genre_id;
            row.insertCell(1).textContent = item.name;
            row.insertCell(2).textContent = item.description || '';
            const actions = row.insertCell(3);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.style.marginRight = '5px';
            editBtn.onclick = () => fillGenreForm(item);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteGenre(item.genre_id, item.name);
            actions.append(editBtn, delBtn);
        });
    } catch (err) {
        document.getElementById('genres-tbody').innerHTML = '<tr><td colspan="4">Ошибка загрузки</tr>';
    }
}

function fillGenreForm(item) {
    document.getElementById('genre-name').value = item.name;
    document.getElementById('genre-description').value = item.description || '';
    document.getElementById('genre-edit-id').value = item.genre_id;
    genreEditId = item.genre_id;
    document.getElementById('genre-form-title').innerText = 'Редактировать жанр';
    document.getElementById('genre-submit').innerText = 'Сохранить';
    document.getElementById('genre-cancel').style.display = 'inline-block';
}

function clearGenreForm() {
    document.getElementById('genre-name').value = '';
    document.getElementById('genre-description').value = '';
    document.getElementById('genre-edit-id').value = '';
    genreEditId = null;
    document.getElementById('genre-form-title').innerText = 'Добавить жанр';
    document.getElementById('genre-submit').innerText = 'Добавить';
    document.getElementById('genre-cancel').style.display = 'none';
}

async function saveGenre() {
    const id = document.getElementById('genre-edit-id').value;
    const name = document.getElementById('genre-name').value.trim();
    const data = {
        name: name,
        description: document.getElementById('genre-description').value.trim() || null
    };
    if (!data.name) { showMessage('genre', 'Название обязательно', true); return; }
    let url = GENRES_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.genre_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showMessage('genre', text.includes('already') ? text : 'Такой жанр уже существует', true);
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).genre_id;
        clearGenreForm();
        await loadGenresTable();
        await loadGenresAndLinks();
        showMessage('genre', `Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, false);
    } catch (err) {
        showMessage('genre', 'Ошибка сохранения', true);
    }
}

async function deleteGenre(id, name) {
    if (!confirm(`Удалить жанр «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${GENRES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadGenresTable();
        await loadGenresAndLinks();
        showMessage('genre', `Запись «${name}» (ID ${id}) удалена`, false);
    } catch (err) {
        showMessage('genre', 'Ошибка удаления', true);
    }
}

document.getElementById('ticket-submit').addEventListener('click', saveTicket);
document.getElementById('ticket-cancel').addEventListener('click', clearTicketForm);
document.getElementById('clothing-submit').addEventListener('click', saveClothing);
document.getElementById('clothing-cancel').addEventListener('click', clearClothingForm);
document.getElementById('accessory-submit').addEventListener('click', saveAccessory);
document.getElementById('accessory-cancel').addEventListener('click', clearAccessoryForm);
document.getElementById('manufacturer-submit').addEventListener('click', saveManufacturer);
document.getElementById('manufacturer-cancel').addEventListener('click', clearManufacturerForm);
document.getElementById('genre-submit').addEventListener('click', saveGenre);
document.getElementById('genre-cancel').addEventListener('click', clearGenreForm);
document.getElementById('apply-filters').addEventListener('click', () => renderCatalog());
document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-name').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-manufacturer').value = '';
    document.querySelectorAll('.genre-checkbox').forEach(cb => cb.checked = false);
    renderCatalog();
});

document.getElementById('edit-ticket-submit').addEventListener('click', saveEditTicket);
document.getElementById('edit-ticket-cancel').addEventListener('click', () => hideEditPanel());
document.getElementById('edit-clothing-submit').addEventListener('click', saveEditClothing);
document.getElementById('edit-clothing-cancel').addEventListener('click', () => hideEditPanel());
document.getElementById('edit-accessory-submit').addEventListener('click', saveEditAccessory);
document.getElementById('edit-accessory-cancel').addEventListener('click', () => hideEditPanel());

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'catalog') {
            refreshCatalogFilters();
            hideEditPanel();
        } else if (btn.dataset.tab === 'add') {
            loadManufacturersForSelect('ticket-manufacturer-id');
            loadManufacturersForSelect('clothing-manufacturer-id');
            loadManufacturersForSelect('accessory-manufacturer-id');
            loadConcertsSelect('ticket-concert-id');
        } else if (btn.dataset.tab === 'manufacturers') {
            loadManufacturersTable();
        } else if (btn.dataset.tab === 'genres') {
            loadGenresTable();
        }
    });
});

loadAllItems();
loadManufacturersForSelect('filter-manufacturer');
loadGenresAndLinks();
loadManufacturersForSelect('edit-ticket-manufacturer-id');
loadManufacturersForSelect('edit-clothing-manufacturer-id');
loadManufacturersForSelect('edit-accessory-manufacturer-id');
loadConcertsSelect('edit-ticket-concert-id');