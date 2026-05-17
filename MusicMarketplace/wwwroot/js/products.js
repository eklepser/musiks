const PRODUCTS_URL = 'https://localhost:7062/api/Products';
const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const MERCHES_URL = 'https://localhost:7062/api/Merches';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MANUFACTURERS_URL = 'https://localhost:7062/api/Manufacturers';

let regularEditId = null;

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

async function loadManufacturers(selectEl) {
    const resp = await fetch(MANUFACTURERS_URL);
    if (resp.ok) {
        const items = await resp.json();
        selectEl.innerHTML = '<option value="">Производитель</option>';
        items.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.manufacturer_id;
            opt.textContent = m.name;
            selectEl.appendChild(opt);
        });
    }
}

// ---------- Обычные товары ----------
async function loadRegularProducts() {
    const resp = await fetch(PRODUCTS_URL);
    if (resp.ok) {
        let products = await resp.json();
        products.sort((a, b) => a.product_id - b.product_id);
        const tbody = document.getElementById('regular-tbody');
        tbody.innerHTML = '';
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
            document.getElementById('total-products').innerText = '0';
            document.getElementById('avg-price').innerText = '0';
            return;
        }
        let total = 0, sum = 0;
        for (const p of products) {
            let manName = '';
            if (p.manufacturer_id) {
                const manRes = await fetch(`${MANUFACTURERS_URL}/${p.manufacturer_id}`);
                if (manRes.ok) manName = (await manRes.json()).name;
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = p.product_id;
            row.insertCell(1).textContent = p.name;
            row.insertCell(2).textContent = p.price;
            row.insertCell(3).textContent = p.stock;
            row.insertCell(4).textContent = manName;
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillRegularForm(p);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteProduct(p.product_id);
            actions.append(editBtn, delBtn);
            total++;
            sum += p.price;
        }
        document.getElementById('total-products').innerText = total;
        document.getElementById('avg-price').innerText = (sum / total).toFixed(2);
    } else {
        showMessage('regular', 'Ошибка загрузки товаров', true);
    }
}

function fillRegularForm(p) {
    document.getElementById('regular-name').value = p.name;
    document.getElementById('regular-price').value = p.price;
    document.getElementById('regular-description').value = p.description || '';
    document.getElementById('regular-stock').value = p.stock;
    document.getElementById('regular-manufacturer-id').value = p.manufacturer_id || '';
    document.getElementById('regular-edit-id').value = p.product_id;
    regularEditId = p.product_id;
    document.getElementById('regular-form-title').innerText = 'Редактировать товар';
    document.getElementById('regular-submit').innerText = 'Сохранить';
    document.getElementById('regular-cancel').style.display = 'inline-block';
}

function clearRegularForm() {
    document.getElementById('regular-name').value = '';
    document.getElementById('regular-price').value = '';
    document.getElementById('regular-description').value = '';
    document.getElementById('regular-stock').value = '';
    document.getElementById('regular-manufacturer-id').value = '';
    document.getElementById('regular-edit-id').value = '';
    regularEditId = null;
    document.getElementById('regular-form-title').innerText = 'Добавить товар';
    document.getElementById('regular-submit').innerText = 'Добавить';
    document.getElementById('regular-cancel').style.display = 'none';
}

async function saveRegular() {
    const id = document.getElementById('regular-edit-id').value;
    const data = {
        name: document.getElementById('regular-name').value.trim(),
        price: parseFloat(document.getElementById('regular-price').value),
        description: document.getElementById('regular-description').value.trim() || null,
        stock: parseInt(document.getElementById('regular-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('regular-manufacturer-id').value) || null
    };
    if (!data.name || isNaN(data.price)) {
        showMessage('regular', 'Заполните название и цену', true);
        return;
    }
    let url = PRODUCTS_URL;
    let method = 'POST';
    if (id) {
        data.product_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    const resp = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (resp.ok) {
        clearRegularForm();
        loadRegularProducts();
        showMessage('regular', 'Товар сохранён', false);
    } else {
        showMessage('regular', 'Ошибка сохранения', true);
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    const resp = await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
    if (resp.ok) {
        loadRegularProducts();
        showMessage('regular', 'Товар удалён', false);
    } else {
        showMessage('regular', 'Ошибка удаления', true);
    }
}

// ---------- Билеты ----------
async function loadTickets() {
    const resp = await fetch(TICKETS_URL);
    if (resp.ok) {
        let tickets = await resp.json();
        const tbody = document.getElementById('ticket-tbody');
        tbody.innerHTML = '';
        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">Нет билетов</td></tr>';
            return;
        }
        for (const t of tickets) {
            // Получаем концерт
            let concertTitle = '';
            if (t.concert_id) {
                const concertResp = await fetch(`${CONCERTS_URL}/${t.concert_id}`);
                if (concertResp.ok) concertTitle = (await concertResp.json()).title;
            }
            // Получаем товар (продукт)
            let productName = '', productPrice = '';
            if (t.product_id) {
                const prodResp = await fetch(`${PRODUCTS_URL}/${t.product_id}`);
                if (prodResp.ok) {
                    const prod = await prodResp.json();
                    productName = prod.name;
                    productPrice = prod.price;
                }
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = t.ticket_id;
            row.insertCell(1).textContent = concertTitle;
            row.insertCell(2).textContent = t.seat_row || '';
            row.insertCell(3).textContent = t.seat_number || '';
            row.insertCell(4).textContent = t.price_category || '';
            row.insertCell(5).textContent = productName;
            row.insertCell(6).textContent = productPrice;
            const actions = row.insertCell(7);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteTicket(t.ticket_id, t.product_id);
            actions.appendChild(delBtn);
        }
    } else {
        showMessage('ticket', 'Ошибка загрузки билетов', true);
    }
}

async function deleteTicket(ticketId, productId) {
    if (!confirm('Удалить билет? Будет также удалён связанный товар.')) return;
    // Сначала удаляем билет
    const ticketResp = await fetch(`${TICKETS_URL}/${ticketId}`, { method: 'DELETE' });
    if (ticketResp.ok && productId) {
        // Удаляем связанный продукт
        await fetch(`${PRODUCTS_URL}/${productId}`, { method: 'DELETE' });
    }
    loadTickets();
    loadRegularProducts(); // Обновим и список товаров
    showMessage('ticket', 'Билет удалён', false);
}

// ---------- Мерч ----------
async function loadMerch() {
    const resp = await fetch(MERCHES_URL);
    if (resp.ok) {
        let merches = await resp.json();
        const tbody = document.getElementById('merch-tbody');
        tbody.innerHTML = '';
        if (merches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Нет мерча</td></tr>';
            return;
        }
        for (const m of merches) {
            let productName = '', productPrice = '';
            if (m.product_id) {
                const prodResp = await fetch(`${PRODUCTS_URL}/${m.product_id}`);
                if (prodResp.ok) {
                    const prod = await prodResp.json();
                    productName = prod.name;
                    productPrice = prod.price;
                }
            }
            const row = tbody.insertRow();
            row.insertCell(0).textContent = m.merch_id;
            row.insertCell(1).textContent = productName;
            row.insertCell(2).textContent = productPrice;
            row.insertCell(3).textContent = m.material || '';
            row.insertCell(4).textContent = m.color || '';
            const actions = row.insertCell(5);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteMerch(m.merch_id, m.product_id);
            actions.appendChild(delBtn);
        }
    } else {
        showMessage('merch', 'Ошибка загрузки мерча', true);
    }
}

async function deleteMerch(merchId, productId) {
    if (!confirm('Удалить мерч? Будет также удалён связанный товар.')) return;
    const merchResp = await fetch(`${MERCHES_URL}/${merchId}`, { method: 'DELETE' });
    if (merchResp.ok && productId) {
        await fetch(`${PRODUCTS_URL}/${productId}`, { method: 'DELETE' });
    }
    loadMerch();
    loadRegularProducts();
    showMessage('merch', 'Мерч удалён', false);
}

// ---------- Инициализация вкладок ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'regular') loadRegularProducts();
        else if (btn.dataset.tab === 'ticket') loadTickets();
        else if (btn.dataset.tab === 'merch') loadMerch();
    });
});

document.getElementById('regular-submit').addEventListener('click', saveRegular);
document.getElementById('regular-cancel').addEventListener('click', clearRegularForm);

// Загружаем производителей для формы
loadManufacturers(document.getElementById('regular-manufacturer-id'));
// Первоначальная загрузка
loadRegularProducts();