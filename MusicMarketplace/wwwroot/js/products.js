const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const CLOTHINGS_URL = 'https://localhost:7062/api/Clothings';
const ACCESSORIES_URL = 'https://localhost:7062/api/Accessories';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MANUFACTURERS_URL = 'https://localhost:7062/api/Manufacturers';

let ticketEditId = null, clothingEditId = null, accessoryEditId = null;
let manufacturers = [];

async function loadManufacturers(selectId) {
    const resp = await fetch(MANUFACTURERS_URL);
    if (resp.ok) {
        manufacturers = await resp.json();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Выберите производителя</option>';
            for (const m of manufacturers) {
                const opt = document.createElement('option');
                opt.value = m.manufacturer_id;
                opt.textContent = m.name;
                select.appendChild(opt);
            }
        }
    }
}

function getManufacturerName(id) {
    const m = manufacturers.find(m => m.manufacturer_id === id);
    return m ? m.name : '';
}

async function loadConcertsSelect(selectId) {
    const resp = await fetch(CONCERTS_URL);
    if (resp.ok) {
        const concerts = await resp.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Выберите концерт</option>';
        for (const c of concerts) {
            const opt = document.createElement('option');
            opt.value = c.concert_id;
            opt.textContent = `${c.title} (ID ${c.concert_id})`;
            select.appendChild(opt);
        }
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

async function loadTickets() {
    try {
        const resp = await fetch(TICKETS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let tickets = await resp.json();
        tickets.sort((a, b) => a.ticket_id - b.ticket_id);
        const tbody = document.getElementById('ticket-tbody');
        tbody.innerHTML = '';
        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9">Нет данных</td></tr>';
            return;
        }
        for (const t of tickets) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = t.ticket_id;
            row.insertCell(1).textContent = t.name;
            row.insertCell(2).textContent = t.price;
            row.insertCell(3).textContent = t.stock;
            row.insertCell(4).textContent = t.concert_title || `ID ${t.concert_id}`;
            row.insertCell(5).textContent = t.seat_row || '';
            row.insertCell(6).textContent = t.seat_number || '';
            row.insertCell(7).textContent = t.price_category || '';
            const actions = row.insertCell(8);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillTicketForm(t);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteTicket(t.ticket_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('ticket-tbody').innerHTML = '<tr><td colspan="9">Ошибка загрузки</td></tr>';
        showMessage('ticket', 'Ошибка: ' + err.message, true);
    }
}

function clearTicketForm() {
    document.getElementById('ticket-name').value = '';
    document.getElementById('ticket-price').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-stock').value = '';
    document.getElementById('ticket-concert-id').value = '';
    document.getElementById('ticket-seat-row').value = '';
    document.getElementById('ticket-seat-number').value = '';
    document.getElementById('ticket-price-category').value = '';
    document.getElementById('ticket-edit-id').value = '';
    ticketEditId = null;
    document.getElementById('ticket-form-title').innerText = 'Добавить билет';
    document.getElementById('ticket-submit').innerText = 'Добавить';
    document.getElementById('ticket-cancel').style.display = 'none';
}

function fillTicketForm(t) {
    document.getElementById('ticket-name').value = t.name;
    document.getElementById('ticket-price').value = t.price;
    document.getElementById('ticket-description').value = t.description || '';
    document.getElementById('ticket-stock').value = t.stock;
    document.getElementById('ticket-concert-id').value = t.concert_id;
    document.getElementById('ticket-seat-row').value = t.seat_row || '';
    document.getElementById('ticket-seat-number').value = t.seat_number || '';
    document.getElementById('ticket-price-category').value = t.price_category || '';
    document.getElementById('ticket-edit-id').value = t.ticket_id;
    ticketEditId = t.ticket_id;
    document.getElementById('ticket-form-title').innerText = 'Редактировать билет';
    document.getElementById('ticket-submit').innerText = 'Сохранить';
    document.getElementById('ticket-cancel').style.display = 'inline-block';
}

async function saveTicket() {
    const errorMsg = validateTicket();
    if (errorMsg) { showMessage('ticket', errorMsg, true); return; }

    const id = document.getElementById('ticket-edit-id').value;
    const data = {
        name: document.getElementById('ticket-name').value.trim(),
        price: parseFloat(document.getElementById('ticket-price').value),
        description: document.getElementById('ticket-description').value.trim(),
        stock: parseInt(document.getElementById('ticket-stock').value) || 0,
        concert_id: parseInt(document.getElementById('ticket-concert-id').value),
        seat_row: document.getElementById('ticket-seat-row').value.trim(),
        seat_number: document.getElementById('ticket-seat-number').value.trim(),
        price_category: document.getElementById('ticket-price-category').value.trim(),
        manufacturer_id: parseInt(document.getElementById('ticket-manufacturer-id').value) || null
    };
    let url = TICKETS_URL, method = 'POST';
    if (id) {
        data.ticket_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.ok) {
            clearTicketForm(); loadTickets(); showMessage('ticket', 'Сохранено', false);
        } else {
            let errText = `Ошибка ${resp.status}`;
            try { const err = await resp.json(); errText = err.title || errText; } catch (e) { }
            showMessage('ticket', errText, true);
        }
    } catch (err) {
        showMessage('ticket', 'Ошибка сети: ' + err.message, true);
    }
}

async function deleteTicket(id) {
    if (!confirm('Удалить билет?')) return;
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE' });
        if (resp.ok) { loadTickets(); showMessage('ticket', 'Удалено', false); }
        else showMessage('ticket', 'Ошибка удаления', true);
    } catch (err) {
        showMessage('ticket', 'Ошибка сети: ' + err.message, true);
    }
}

async function loadClothings() {
    try {
        const resp = await fetch(CLOTHINGS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let clothings = await resp.json();
        clothings.sort((a, b) => a.clothing_id - b.clothing_id);
        const tbody = document.getElementById('clothing-tbody');
        tbody.innerHTML = '';
        if (clothings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10">Нет данных</td></tr>';
            return;
        }
        for (const c of clothings) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = c.clothing_id;
            row.insertCell(1).textContent = c.name;
            row.insertCell(2).textContent = getManufacturerName(c.manufacturer_id);
            row.insertCell(3).textContent = c.price;
            row.insertCell(4).textContent = c.stock;
            row.insertCell(5).textContent = c.material || '';
            row.insertCell(6).textContent = c.color || '';
            row.insertCell(7).textContent = c.size || '';
            row.insertCell(8).textContent = c.gender || '';
            const actions = row.insertCell(9);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillClothingForm(c);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteClothing(c.clothing_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('clothing-tbody').innerHTML = '<td><td colspan="10">Ошибка загрузки</td></tr>';
        showMessage('clothing', 'Ошибка: ' + err.message, true);
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
    document.getElementById('clothing-form-title').innerText = 'Добавить одежду';
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
}

function fillClothingForm(c) {
    document.getElementById('clothing-name').value = c.name;
    document.getElementById('clothing-price').value = c.price;
    document.getElementById('clothing-description').value = c.description || '';
    document.getElementById('clothing-stock').value = c.stock;
    document.getElementById('clothing-manufacturer-id').value = c.manufacturer_id || '';
    document.getElementById('clothing-material').value = c.material || '';
    document.getElementById('clothing-color').value = c.color || '';
    document.getElementById('clothing-size').value = c.size || 'M';
    document.getElementById('clothing-gender').value = c.gender || 'unisex';
    document.getElementById('clothing-edit-id').value = c.clothing_id;
    clothingEditId = c.clothing_id;
    document.getElementById('clothing-form-title').innerText = 'Редактировать одежду';
    document.getElementById('clothing-submit').innerText = 'Сохранить';
    document.getElementById('clothing-cancel').style.display = 'inline-block';
}

async function saveClothing() {
    const errorMsg = validateClothing();
    if (errorMsg) { showMessage('clothing', errorMsg, true); return; }

    const id = document.getElementById('clothing-edit-id').value;
    const data = {
        name: document.getElementById('clothing-name').value.trim(),
        price: parseFloat(document.getElementById('clothing-price').value),
        description: document.getElementById('clothing-description').value.trim(),
        stock: parseInt(document.getElementById('clothing-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('clothing-manufacturer-id').value) || null,
        material: document.getElementById('clothing-material').value.trim(),
        color: document.getElementById('clothing-color').value.trim(),
        size: document.getElementById('clothing-size').value,
        gender: document.getElementById('clothing-gender').value
    };
    let url = CLOTHINGS_URL, method = 'POST';
    if (id) {
        data.clothing_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.ok) {
            clearClothingForm(); loadClothings(); showMessage('clothing', 'Сохранено', false);
        } else {
            let errText = `Ошибка ${resp.status}`;
            try { const err = await resp.json(); errText = err.title || errText; } catch (e) { }
            showMessage('clothing', errText, true);
        }
    } catch (err) {
        showMessage('clothing', 'Ошибка сети: ' + err.message, true);
    }
}

async function deleteClothing(id) {
    if (!confirm('Удалить одежду?')) return;
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
        if (resp.ok) { loadClothings(); showMessage('clothing', 'Удалено', false); }
        else showMessage('clothing', 'Ошибка удаления', true);
    } catch (err) {
        showMessage('clothing', 'Ошибка сети: ' + err.message, true);
    }
}

async function loadAccessories() {
    try {
        const resp = await fetch(ACCESSORIES_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let accessories = await resp.json();
        accessories.sort((a, b) => a.accessory_id - b.accessory_id);
        const tbody = document.getElementById('accessory-tbody');
        tbody.innerHTML = '';
        if (accessories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10">Нет данных</td></tr>';
            return;
        }
        for (const a of accessories) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = a.accessory_id;
            row.insertCell(1).textContent = a.name;
            row.insertCell(2).textContent = getManufacturerName(a.manufacturer_id);
            row.insertCell(3).textContent = a.price;
            row.insertCell(4).textContent = a.stock;
            row.insertCell(5).textContent = a.material || '';
            row.insertCell(6).textContent = a.color || '';
            row.insertCell(7).textContent = a.accessory_type || '';
            row.insertCell(8).textContent = a.weight || '';
            const actions = row.insertCell(9);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillAccessoryForm(a);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteAccessory(a.accessory_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('accessory-tbody').innerHTML = '<tr><td colspan="10">Ошибка загрузки</td></tr>';
        showMessage('accessory', 'Ошибка: ' + err.message, true);
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
    document.getElementById('accessory-form-title').innerText = 'Добавить аксессуар';
    document.getElementById('accessory-submit').innerText = 'Добавить';
    document.getElementById('accessory-cancel').style.display = 'none';
}

function fillAccessoryForm(a) {
    document.getElementById('accessory-name').value = a.name;
    document.getElementById('accessory-price').value = a.price;
    document.getElementById('accessory-description').value = a.description || '';
    document.getElementById('accessory-stock').value = a.stock;
    document.getElementById('accessory-manufacturer-id').value = a.manufacturer_id || '';
    document.getElementById('accessory-material').value = a.material || '';
    document.getElementById('accessory-color').value = a.color || '';
    document.getElementById('accessory-type').value = a.accessory_type || '';
    document.getElementById('accessory-weight').value = a.weight || '';
    document.getElementById('accessory-edit-id').value = a.accessory_id;
    accessoryEditId = a.accessory_id;
    document.getElementById('accessory-form-title').innerText = 'Редактировать аксессуар';
    document.getElementById('accessory-submit').innerText = 'Сохранить';
    document.getElementById('accessory-cancel').style.display = 'inline-block';
}

async function saveAccessory() {
    const errorMsg = validateAccessory();
    if (errorMsg) { showMessage('accessory', errorMsg, true); return; }

    const id = document.getElementById('accessory-edit-id').value;
    const data = {
        name: document.getElementById('accessory-name').value.trim(),
        price: parseFloat(document.getElementById('accessory-price').value),
        description: document.getElementById('accessory-description').value.trim(),
        stock: parseInt(document.getElementById('accessory-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('accessory-manufacturer-id').value) || null,
        material: document.getElementById('accessory-material').value.trim(),
        color: document.getElementById('accessory-color').value.trim(),
        accessory_type: document.getElementById('accessory-type').value.trim(),
        weight: parseFloat(document.getElementById('accessory-weight').value) || null
    };
    let url = ACCESSORIES_URL, method = 'POST';
    if (id) {
        data.accessory_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.ok) {
            clearAccessoryForm(); loadAccessories(); showMessage('accessory', 'Сохранено', false);
        } else {
            let errText = `Ошибка ${resp.status}`;
            try { const err = await resp.json(); errText = err.title || errText; } catch (e) { }
            showMessage('accessory', errText, true);
        }
    } catch (err) {
        showMessage('accessory', 'Ошибка сети: ' + err.message, true);
    }
}

async function deleteAccessory(id) {
    if (!confirm('Удалить аксессуар?')) return;
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
        if (resp.ok) { loadAccessories(); showMessage('accessory', 'Удалено', false); }
        else showMessage('accessory', 'Ошибка удаления', true);
    } catch (err) {
        showMessage('accessory', 'Ошибка сети: ' + err.message, true);
    }
}

document.getElementById('ticket-submit').addEventListener('click', saveTicket);
document.getElementById('ticket-cancel').addEventListener('click', clearTicketForm);
document.getElementById('clothing-submit').addEventListener('click', saveClothing);
document.getElementById('clothing-cancel').addEventListener('click', clearClothingForm);
document.getElementById('accessory-submit').addEventListener('click', saveAccessory);
document.getElementById('accessory-cancel').addEventListener('click', clearAccessoryForm);

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'ticket') {
            loadTickets(); loadConcertsSelect('ticket-concert-id');
        } else if (btn.dataset.tab === 'clothing') {
            loadClothings();
        } else if (btn.dataset.tab === 'accessory') {
            loadAccessories();
        }
    });
});

loadManufacturers('clothing-manufacturer-id');
loadManufacturers('ticket-manufacturer-id');
loadManufacturers('accessory-manufacturer-id');
loadConcertsSelect('ticket-concert-id');
loadTickets();
loadClothings();
loadAccessories();