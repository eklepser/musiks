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
            ...tickets.map(t => ({ ...t, type: 'ticket', typeName: 'Билет', product_id: t.product_id })),
            ...clothings.map(c => ({ ...c, type: 'clothing', typeName: 'Одежда', product_id: c.product_id })),
            ...accessories.map(a => ({ ...a, type: 'accessory', typeName: 'Аксессуар', product_id: a.product_id }))
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
        tbody.innerHTML = '<tr><td colspan="8">Нет данных';
        return;
    }
    filtered.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.typeName;
        row.insertCell(2).textContent = item.name;
        row.insertCell(3).textContent = item.price;
        row.insertCell(4).textContent = item.stock;
        row.insertCell(5).textContent = getManufacturerName(item.manufacturer_id);

        let extraLines = [];
        if (item.type === 'ticket') {
            extraLines.push(`Концерт: ${item.concert_title || item.concert_id}`);
            if (item.seat_row || item.seat_number) extraLines.push(`Место: ${item.seat_row || ''} ${item.seat_number || ''}`);
            if (item.price_category) extraLines.push(`Категория: ${item.price_category}`);
        } else if (item.type === 'clothing') {
            if (item.material) extraLines.push(`Материал: ${item.material}`);
            if (item.color) extraLines.push(`Цвет: ${item.color}`);
            if (item.size) extraLines.push(`Размер: ${item.size}`);
            if (item.gender) extraLines.push(`Пол: ${item.gender}`);
        } else if (item.type === 'accessory') {
            if (item.material) extraLines.push(`Материал: ${item.material}`);
            if (item.color) extraLines.push(`Цвет: ${item.color}`);
            if (item.accessory_type) extraLines.push(`Тип: ${item.accessory_type}`);
            if (item.weight) extraLines.push(`Вес: ${item.weight} г`);
        }
        const extraText = extraLines.length ? extraLines.join('\n') : '—';
        const extraCell = row.insertCell(6);
        extraCell.style.whiteSpace = 'pre-wrap';
        extraCell.textContent = extraText;

        const actions = row.insertCell(7);
        const topRow = document.createElement('div');
        topRow.className = 'action-buttons-row';
        const bottomRow = document.createElement('div');
        bottomRow.className = 'action-buttons-row';

        const inWishlist = userWishlistIds.includes(item.product_id);
        const wishBtn = document.createElement('button');
        wishBtn.textContent = '❤️';
        wishBtn.style.marginRight = '5px';
        if (inWishlist) {
            wishBtn.style.background = '#dc3545';
            wishBtn.title = 'Удалить из вишлиста';
            wishBtn.onclick = () => removeFromWishlist(item.product_id);
        } else {
            wishBtn.style.background = '#ffc107';
            wishBtn.title = 'В вишлист';
            wishBtn.onclick = () => addToWishlist(item.product_id, item.name);
        }

        const inCart = userCartIds.includes(item.product_id);
        const cartBtn = document.createElement('button');
        cartBtn.textContent = '🛒';
        cartBtn.style.marginRight = '5px';
        if (inCart) {
            cartBtn.style.background = '#28a745';
            cartBtn.title = 'Удалить из корзины';
            cartBtn.onclick = () => removeFromCart(item.product_id);
        } else {
            cartBtn.style.background = '#28a745';
            cartBtn.title = 'В корзину';
            cartBtn.onclick = () => {
                currentProductForCart = { id: item.product_id, name: item.name };
                showCartModal();
            };
        }

        const inReviews = userReviewProductIds.includes(item.product_id);
        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = '✍️';
        reviewBtn.style.marginRight = '5px';
        if (inReviews) {
            reviewBtn.style.background = '#dc3545';
            reviewBtn.title = 'Удалить отзыв';
            reviewBtn.onclick = () => deleteReview(item.product_id);
        } else {
            reviewBtn.style.background = '#17a2b8';
            reviewBtn.title = 'Оставить отзыв';
            reviewBtn.onclick = () => {
                currentProductForReview = { id: item.product_id, name: item.name };
                showReviewModal();
            };
        }

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