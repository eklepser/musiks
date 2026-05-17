const PRODUCTS_URL = 'https://localhost:7062/api/Products';
const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const CLOTHINGS_URL = 'https://localhost:7062/api/Clothings';
const ACCESSORIES_URL = 'https://localhost:7062/api/Accessories';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MERCH_URL = 'https://localhost:7062/api/Merch';

let allEditId = null, ticketEditId = null, clothingEditId = null, accessoryEditId = null;

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

async function loadAllProducts() {
    try {
        const resp = await fetch(PRODUCTS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let products = await resp.json();
        products.sort((a, b) => a.product_id - b.product_id);
        const tbody = document.getElementById('all-tbody');
        tbody.innerHTML = '';
        if (products.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>'; return; }
        for (const p of products) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = p.product_id;
            row.insertCell(1).textContent = p.name;
            row.insertCell(2).textContent = p.price;
            row.insertCell(3).textContent = p.stock;
            row.insertCell(4).textContent = p.manufacturer_id || '';
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillAllForm(p);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteProduct(p.product_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('all-tbody').innerHTML = `<tr><td colspan="6">Ошибка: ${err.message}</td></tr>`;
    }
}

function fillAllForm(p) {
    document.getElementById('all-name').value = p.name;
    document.getElementById('all-price').value = p.price;
    document.getElementById('all-description').value = p.description || '';
    document.getElementById('all-stock').value = p.stock;
    document.getElementById('all-manufacturer-id').value = p.manufacturer_id || '';
    document.getElementById('all-edit-id').value = p.product_id;
    allEditId = p.product_id;
    document.getElementById('all-form-title').innerText = 'Редактировать товар';
    document.getElementById('all-submit').innerText = 'Сохранить';
    document.getElementById('all-cancel').style.display = 'inline-block';
}

function clearAllForm() {
    document.getElementById('all-name').value = '';
    document.getElementById('all-price').value = '';
    document.getElementById('all-description').value = '';
    document.getElementById('all-stock').value = '';
    document.getElementById('all-manufacturer-id').value = '';
    document.getElementById('all-edit-id').value = '';
    allEditId = null;
    document.getElementById('all-form-title').innerText = 'Добавить товар';
    document.getElementById('all-submit').innerText = 'Добавить';
    document.getElementById('all-cancel').style.display = 'none';
}

async function saveAllProduct() {
    const id = document.getElementById('all-edit-id').value;
    const data = {
        name: document.getElementById('all-name').value.trim(),
        price: parseFloat(document.getElementById('all-price').value),
        description: document.getElementById('all-description').value.trim(),
        stock: parseInt(document.getElementById('all-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('all-manufacturer-id').value) || null
    };
    if (!data.name || isNaN(data.price)) { showMessage('all', 'Заполните название и цену', true); return; }
    let url = PRODUCTS_URL, method = 'POST';
    if (id) { data.product_id = parseInt(id); url += `/${id}`; method = 'PUT'; }
    const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (resp.ok) { clearAllForm(); loadAllProducts(); showMessage('all', 'Сохранено', false); }
    else showMessage('all', 'Ошибка сохранения', true);
}

async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    const resp = await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
    if (resp.ok) { loadAllProducts(); showMessage('all', 'Удалено', false); }
    else showMessage('all', 'Ошибка удаления', true);
}

async function loadTickets() {
    try {
        const resp = await fetch(TICKETS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let tickets = await resp.json();
        tickets.sort((a, b) => a.ticket_id - b.ticket_id);
        const tbody = document.getElementById('ticket-tbody');
        tbody.innerHTML = '';
        if (tickets.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>'; return; }
        for (const t of tickets) {
            let productName = '', concertTitle = '';
            if (t.product_id) {
                const prodResp = await fetch(`${PRODUCTS_URL}/${t.product_id}`);
                if (prodResp.ok) productName = (await prodResp.json()).name;
            }
            if (t.concert_id) {
                const concResp = await fetch(`${CONCERTS_URL}/${t.concert_id}`);
                if (concResp.ok) concertTitle = (await concResp.json()).title;
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = t.ticket_id;
            row.insertCell(1).textContent = productName;
            row.insertCell(2).textContent = concertTitle;
            row.insertCell(3).textContent = `${t.seat_row || ''} ${t.seat_number || ''}`;
            row.insertCell(4).textContent = t.price_category || '';
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillTicketForm(t);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteTicket(t.ticket_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('ticket-tbody').innerHTML = `<tr><td colspan="6">Ошибка: ${err.message}</td></tr>`;
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
    document.getElementById('ticket-form-title').innerText = 'Добавить билет';
    document.getElementById('ticket-submit').innerText = 'Добавить';
    document.getElementById('ticket-cancel').style.display = 'none';
}

function fillTicketForm(t) {
    fetch(`${PRODUCTS_URL}/${t.product_id}`).then(resp => resp.json()).then(prod => {
        document.getElementById('ticket-name').value = prod.name;
        document.getElementById('ticket-price').value = prod.price;
        document.getElementById('ticket-description').value = prod.description || '';
        document.getElementById('ticket-stock').value = prod.stock;
        document.getElementById('ticket-manufacturer-id').value = prod.manufacturer_id || '';
        document.getElementById('ticket-concert-id').value = t.concert_id;
        document.getElementById('ticket-seat-row').value = t.seat_row || '';
        document.getElementById('ticket-seat-number').value = t.seat_number || '';
        document.getElementById('ticket-price-category').value = t.price_category || '';
        document.getElementById('ticket-edit-id').value = t.ticket_id;
        ticketEditId = t.ticket_id;
        document.getElementById('ticket-form-title').innerText = 'Редактировать билет';
        document.getElementById('ticket-submit').innerText = 'Сохранить';
        document.getElementById('ticket-cancel').style.display = 'inline-block';
    });
}

async function saveTicket() {
    const id = document.getElementById('ticket-edit-id').value;
    const data = {
        name: document.getElementById('ticket-name').value.trim(),
        price: parseFloat(document.getElementById('ticket-price').value),
        description: document.getElementById('ticket-description').value.trim(),
        stock: parseInt(document.getElementById('ticket-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('ticket-manufacturer-id').value) || null,
        concert_id: parseInt(document.getElementById('ticket-concert-id').value),
        seat_row: document.getElementById('ticket-seat-row').value.trim(),
        seat_number: document.getElementById('ticket-seat-number').value.trim(),
        price_category: document.getElementById('ticket-price-category').value.trim()
    };
    if (!data.name || isNaN(data.price) || !data.concert_id) {
        showMessage('ticket', 'Заполните обязательные поля', true);
        return;
    }
    if (id) {
        showMessage('ticket', 'Редактирование билета не поддерживается', true);
        return;
    }
    const resp = await fetch(TICKETS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (resp.ok) {
        clearTicketForm(); loadTickets(); showMessage('ticket', 'Билет добавлен', false);
    } else {
        const err = await resp.json();
        showMessage('ticket', 'Ошибка: ' + (err.title || resp.status), true);
    }
}

async function deleteTicket(id) {
    if (!confirm('Удалить билет?')) return;
    const resp = await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE' });
    if (resp.ok) { loadTickets(); showMessage('ticket', 'Удалено', false); }
    else showMessage('ticket', 'Ошибка удаления', true);
}

async function loadClothings() {
    try {
        const resp = await fetch(CLOTHINGS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let clothings = await resp.json();
        clothings.sort((a, b) => a.clothing_id - b.clothing_id);
        const tbody = document.getElementById('clothing-tbody');
        tbody.innerHTML = '';
        if (clothings.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>'; return; }
        for (const c of clothings) {
            let productName = '';
            if (c.merch_id) {
                const merchResp = await fetch(`${MERCH_URL}/${c.merch_id}`);
                if (merchResp.ok) {
                    const merch = await merchResp.json();
                    const prodResp = await fetch(`${PRODUCTS_URL}/${merch.product_id}`);
                    if (prodResp.ok) productName = (await prodResp.json()).name;
                }
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = c.clothing_id;
            row.insertCell(1).textContent = c.merch_id;
            row.insertCell(2).textContent = productName;
            row.insertCell(3).textContent = c.size || '';
            row.insertCell(4).textContent = c.gender || '';
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillClothingForm(c);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteClothing(c.clothing_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('clothing-tbody').innerHTML = `<tr><td colspan="6">Ошибка: ${err.message}</td></tr>`;
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
    document.getElementById('clothing-size').value = '';
    document.getElementById('clothing-gender').value = '';
    document.getElementById('clothing-edit-id').value = '';
    clothingEditId = null;
    document.getElementById('clothing-form-title').innerText = 'Добавить одежду';
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
}

function fillClothingForm(c) {
    fetch(`${MERCH_URL}/${c.merch_id}`).then(resp => resp.json()).then(merch => {
        fetch(`${PRODUCTS_URL}/${merch.product_id}`).then(resp => resp.json()).then(prod => {
            document.getElementById('clothing-name').value = prod.name;
            document.getElementById('clothing-price').value = prod.price;
            document.getElementById('clothing-description').value = prod.description || '';
            document.getElementById('clothing-stock').value = prod.stock;
            document.getElementById('clothing-manufacturer-id').value = prod.manufacturer_id || '';
            document.getElementById('clothing-material').value = merch.material || '';
            document.getElementById('clothing-color').value = merch.color || '';
            document.getElementById('clothing-size').value = c.size || '';
            document.getElementById('clothing-gender').value = c.gender || '';
            document.getElementById('clothing-edit-id').value = c.clothing_id;
            clothingEditId = c.clothing_id;
            document.getElementById('clothing-form-title').innerText = 'Редактировать одежду';
            document.getElementById('clothing-submit').innerText = 'Сохранить';
            document.getElementById('clothing-cancel').style.display = 'inline-block';
        });
    });
}

async function saveClothing() {
    const id = document.getElementById('clothing-edit-id').value;
    const data = {
        name: document.getElementById('clothing-name').value.trim(),
        price: parseFloat(document.getElementById('clothing-price').value),
        description: document.getElementById('clothing-description').value.trim(),
        stock: parseInt(document.getElementById('clothing-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('clothing-manufacturer-id').value) || null,
        material: document.getElementById('clothing-material').value.trim(),
        color: document.getElementById('clothing-color').value.trim(),
        size: document.getElementById('clothing-size').value.trim(),
        gender: document.getElementById('clothing-gender').value
    };
    if (!data.name || isNaN(data.price)) { showMessage('clothing', 'Заполните название и цену', true); return; }
    if (id) {
        showMessage('clothing', 'Редактирование одежды не поддерживается', true);
        return;
    }
    const resp = await fetch(CLOTHINGS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (resp.ok) {
        clearClothingForm(); loadClothings(); showMessage('clothing', 'Одежда добавлена', false);
    } else {
        const err = await resp.json();
        showMessage('clothing', 'Ошибка: ' + (err.title || resp.status), true);
    }
}

async function deleteClothing(id) {
    if (!confirm('Удалить одежду?')) return;
    const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
    if (resp.ok) { loadClothings(); showMessage('clothing', 'Удалено', false); }
    else showMessage('clothing', 'Ошибка удаления', true);
}

async function loadAccessories() {
    try {
        const resp = await fetch(ACCESSORIES_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let accessories = await resp.json();
        accessories.sort((a, b) => a.accessory_id - b.accessory_id);
        const tbody = document.getElementById('accessory-tbody');
        tbody.innerHTML = '';
        if (accessories.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>'; return; }
        for (const a of accessories) {
            let productName = '';
            if (a.merch_id) {
                const merchResp = await fetch(`${MERCH_URL}/${a.merch_id}`);
                if (merchResp.ok) {
                    const merch = await merchResp.json();
                    const prodResp = await fetch(`${PRODUCTS_URL}/${merch.product_id}`);
                    if (prodResp.ok) productName = (await prodResp.json()).name;
                }
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = a.accessory_id;
            row.insertCell(1).textContent = a.merch_id;
            row.insertCell(2).textContent = productName;
            row.insertCell(3).textContent = a.accessory_type || '';
            row.insertCell(4).textContent = a.weight || '';
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillAccessoryForm(a);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteAccessory(a.accessory_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        document.getElementById('accessory-tbody').innerHTML = `<tr><td colspan="6">Ошибка: ${err.message}</td></tr>`;
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
    fetch(`${MERCH_URL}/${a.merch_id}`).then(resp => resp.json()).then(merch => {
        fetch(`${PRODUCTS_URL}/${merch.product_id}`).then(resp => resp.json()).then(prod => {
            document.getElementById('accessory-name').value = prod.name;
            document.getElementById('accessory-price').value = prod.price;
            document.getElementById('accessory-description').value = prod.description || '';
            document.getElementById('accessory-stock').value = prod.stock;
            document.getElementById('accessory-manufacturer-id').value = prod.manufacturer_id || '';
            document.getElementById('accessory-material').value = merch.material || '';
            document.getElementById('accessory-color').value = merch.color || '';
            document.getElementById('accessory-type').value = a.accessory_type || '';
            document.getElementById('accessory-weight').value = a.weight || '';
            document.getElementById('accessory-edit-id').value = a.accessory_id;
            accessoryEditId = a.accessory_id;
            document.getElementById('accessory-form-title').innerText = 'Редактировать аксессуар';
            document.getElementById('accessory-submit').innerText = 'Сохранить';
            document.getElementById('accessory-cancel').style.display = 'inline-block';
        });
    });
}

async function saveAccessory() {
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
    if (!data.name || isNaN(data.price)) { showMessage('accessory', 'Заполните название и цену', true); return; }
    if (id) {
        showMessage('accessory', 'Редактирование аксессуара не поддерживается', true);
        return;
    }
    const resp = await fetch(ACCESSORIES_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (resp.ok) {
        clearAccessoryForm(); loadAccessories(); showMessage('accessory', 'Аксессуар добавлен', false);
    } else {
        const err = await resp.json();
        showMessage('accessory', 'Ошибка: ' + (err.title || resp.status), true);
    }
}

async function deleteAccessory(id) {
    if (!confirm('Удалить аксессуар?')) return;
    const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
    if (resp.ok) { loadAccessories(); showMessage('accessory', 'Удалено', false); }
    else showMessage('accessory', 'Ошибка удаления', true);
}

document.getElementById('all-submit').addEventListener('click', saveAllProduct);
document.getElementById('all-cancel').addEventListener('click', clearAllForm);
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
        if (btn.dataset.tab === 'all') loadAllProducts();
        else if (btn.dataset.tab === 'ticket') { loadTickets(); loadConcertsSelect('ticket-concert-id'); }
        else if (btn.dataset.tab === 'clothing') loadClothings();
        else if (btn.dataset.tab === 'accessory') loadAccessories();
    });
});

loadAllProducts();
loadConcertsSelect('ticket-concert-id');
loadTickets();
loadClothings();
loadAccessories();