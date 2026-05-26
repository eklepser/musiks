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
    window.selectedGenresForTicket = [];
    if (typeof renderTicketSelectedGenres === 'function') renderTicketSelectedGenres();
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
    window.selectedGenresForTicket = t.genreIds || [];
    if (typeof renderEditTicketSelectedGenres === 'function') renderEditTicketSelectedGenres();
    loadProductGenresForEdit(t.product_id, 'ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function validateTicketFields(name, price, stock, manufacturerId, concertId, priceCategory, description) {
    let err = validateRequiredString(name, 'Название', 2, 200, true);
    if (err) return err;
    err = validatePrice(price);
    if (err) return err;
    err = validateStock(stock);
    if (err) return err;
    if (!manufacturerId) return 'Выберите производителя';
    if (!concertId) return 'Выберите концерт';
    if (priceCategory && priceCategory.trim()) {
        err = validateOptionalString(priceCategory, 'Тип места', 50);
        if (err) return err;
    }
    if (description && description.trim()) {
        err = validateOptionalString(description, 'Описание', 1000);
        if (err) return err;
    }
    return null;
}
async function saveEditTicket() {
    const id = document.getElementById('edit-ticket-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-ticket-manufacturer-id').value);
    const name = document.getElementById('edit-ticket-name').value.trim();
    const price = document.getElementById('edit-ticket-price').value;
    const concertId = document.getElementById('edit-ticket-concert-id').value;
    const stock = document.getElementById('edit-ticket-stock').value;
    const priceCategory = document.getElementById('edit-ticket-price-category').value.trim();
    const description = document.getElementById('edit-ticket-description').value.trim();
    const validationError = validateTicketFields(name, price, stock, manufacturerId, concertId, priceCategory, description);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        ticket_id: parseInt(id),
        name: name,
        price: parseFloat(price),
        description: description || null,
        stock: parseInt(stock, 10),
        concert_id: parseInt(concertId),
        price_category: priceCategory || null,
        manufacturer_id: manufacturerId,
        genreIds: window.selectedGenresForTicket
    };
    try {
        const resp = await fetch(`${TICKETS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка обновления';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showToast(msg, 'error');
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
    const price = document.getElementById('ticket-price').value;
    const concertId = document.getElementById('ticket-concert-id').value;
    const stock = document.getElementById('ticket-stock').value;
    const priceCategory = document.getElementById('ticket-price-category').value.trim();
    const description = document.getElementById('ticket-description').value.trim();
    const manufacturerId = parseInt(document.getElementById('ticket-manufacturer-id').value);
    const validationError = validateTicketFields(name, price, stock, manufacturerId, concertId, priceCategory, description);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const id = document.getElementById('ticket-edit-id').value;
    const data = {
        name: name,
        price: parseFloat(price),
        description: description || null,
        stock: parseInt(stock, 10),
        concert_id: parseInt(concertId),
        price_category: priceCategory || null,
        manufacturer_id: manufacturerId || null,
        genreIds: window.selectedGenresForTicket
    };
    let url = TICKETS_URL, method = 'POST';
    if (id) {
        data.ticket_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка сохранения';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showToast(msg, 'error');
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
        if (!resp.ok) {
            const error = await resp.json();
            showToast(error.message || 'Невозможно удалить билет', 'error');
            return;
        }
        hideEditPanel();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}