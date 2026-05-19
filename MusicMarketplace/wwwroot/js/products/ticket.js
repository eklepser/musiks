// ticket.js
let ticketEditId = null;

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

async function saveEditTicket() {
    const id = document.getElementById('edit-ticket-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-ticket-manufacturer-id').value);
    if (!manufacturerId) {
        showToast('Выберите производителя', 'error');
        return;
    }
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
        manufacturer_id: manufacturerId
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
        hideEditPanel();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка обновления', 'error');
    }
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}