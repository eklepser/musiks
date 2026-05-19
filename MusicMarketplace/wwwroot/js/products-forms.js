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
    if (errorMsg) { showToast(errorMsg, 'error'); return; }
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
            showToast(text.includes('already') ? text : 'Такой билет уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).ticket_id;
        clearTicketForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
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
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).clothing_id;
        clearClothingForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлена' : 'добавлена'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
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
            showToast(text.includes('already') ? text : 'Такой аксессуар уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).accessory_id;
        clearAccessoryForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
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
            tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
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
        document.getElementById('manufacturers-tbody').innerHTML = '</table><td colspan="4">Ошибка загрузки</td></tr>';
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
    if (!data.name) { showToast('Название обязательно', 'error'); return; }
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
            showToast(text.includes('already') ? text : 'Такой производитель уже существует', 'error');
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
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
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
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
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
            tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
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
        document.getElementById('genres-tbody').innerHTML = '<tr><td colspan="4">Ошибка загрузки</td></tr>';
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
    if (!data.name) { showToast('Название обязательно', 'error'); return; }
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
            showToast(text.includes('already') ? text : 'Такой жанр уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).genre_id;
        clearGenreForm();
        await loadGenresTable();
        await loadGenresAndLinks();
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteGenre(id, name) {
    if (!confirm(`Удалить жанр «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${GENRES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadGenresTable();
        await loadGenresAndLinks();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
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