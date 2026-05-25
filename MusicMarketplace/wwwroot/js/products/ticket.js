let ticketEditId = null;

function clearTicketForm() {
    document.getElementById('ticket-name').value = '';
    document.getElementById('ticket-price').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-stock').value = '';
    document.getElementById('ticket-manufacturer-id').value = '';
    document.getElementById('ticket-concert-id').value = '';
    document.getElementById('ticket-price-category').value = '';
    document.getElementById('ticket-edit-id').value = '';
    ticketEditId = null;
    document.getElementById('ticket-submit').innerText = 'Добавить';
    document.getElementById('ticket-cancel').style.display = 'none';
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
    document.getElementById('edit-ticket-price-category').value = t.price_category || '';
    document.getElementById('edit-ticket-form').style.display = 'block';
}

function validateTicketFields(name, price, concertId, stock) {
    if (!name || name.trim() === '') return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price) || price === '') return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    if (!concertId) return 'Выберите концерт.';
    if (stock !== undefined && stock !== null && stock < 0) return 'Остаток не может быть отрицательным.';
    return null;
}

async function saveEditTicket() {
    const id = document.getElementById('edit-ticket-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-ticket-manufacturer-id').value);
    if (!manufacturerId) {
        showToast('Выберите производителя', 'error');
        return;
    }
    const name = document.getElementById('edit-ticket-name').value.trim();
    const price = parseFloat(document.getElementById('edit-ticket-price').value);
    const concertId = document.getElementById('edit-ticket-concert-id').value;
    const stock = parseInt(document.getElementById('edit-ticket-stock').value) || 0;
    const validationError = validateTicketFields(name, price, concertId, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        ticket_id: parseInt(id),
        name: name,
        price: price,
        description: document.getElementById('edit-ticket-description').value.trim(),
        stock: stock,
        concert_id: parseInt(concertId),
        price_category: document.getElementById('edit-ticket-price-category').value.trim(),
        manufacturer_id: manufacturerId
    };
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

async function saveTicket() {
    const name = document.getElementById('ticket-name').value.trim();
    const price = parseFloat(document.getElementById('ticket-price').value);
    const concertId = document.getElementById('ticket-concert-id').value;
    const stock = parseInt(document.getElementById('ticket-stock').value) || 0;
    const validationError = validateTicketFields(name, price, concertId, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const id = document.getElementById('ticket-edit-id').value;
    const data = {
        name: name,
        price: price,
        description: document.getElementById('ticket-description').value.trim(),
        stock: stock,
        concert_id: parseInt(concertId),
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
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой билет уже существует', 'error');
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
            newId = result.ticket_id;
            clearTicketForm();
            await loadAllItems();
            showToast(`Запись «${name}» (ID ${newId}) добавлена`, 'success');
            return;
        }
        clearTicketForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteTicket(id, name) {
    if (!confirm(`Удалить билет «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE' });
        if (resp.status === 409) {
            const errorMessage = await resp.text();
            showToast(errorMessage || 'Невозможно удалить билет, который есть в заказах', 'error');
            return;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}
