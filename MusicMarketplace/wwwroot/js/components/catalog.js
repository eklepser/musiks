window.Catalog = (function () {
    async function render() {
        const searchName = document.getElementById('search-name')?.value.trim() || '';
        const filterType = document.getElementById('filter-type')?.value || '';
        const filterManufacturerId = document.getElementById('filter-manufacturer')?.value || '';
        const filterArtistId = document.getElementById('filter-artist')?.value || '';
        const filterInStock = document.getElementById('filter-in-stock')?.checked || false;
        const priceMin = document.getElementById('price-min')?.value || '';
        const priceMax = document.getElementById('price-max')?.value || '';
        const sortBy = document.getElementById('sort-by')?.value || '';
        const selectedGenres = window.getSelectedGenres ? window.getSelectedGenres() : [];

        const params = [];
        if (searchName) params.push(`searchName=${encodeURIComponent(searchName)}`);
        if (filterType) params.push(`type=${filterType}`);
        if (filterManufacturerId) params.push(`manufacturerId=${filterManufacturerId}`);
        if (filterArtistId) params.push(`artistId=${filterArtistId}`);
        if (filterInStock) params.push(`inStock=true`);
        if (priceMin) params.push(`priceMin=${priceMin}`);
        if (priceMax) params.push(`priceMax=${priceMax}`);
        if (sortBy) params.push(`sortBy=${sortBy}`);
        if (selectedGenres.length) params.push(`selectedGenres=${encodeURIComponent(selectedGenres.join(','))}`);

        const url = `${window.API_URLS.PRODUCTS_FILTER}?${params.join('&')}`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            let items = await resp.json();

            const countSpan = document.getElementById('found-count');
            if (countSpan) countSpan.innerText = items.length;
            const tbody = document.getElementById('catalog-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="centered-message">Нет данных</tbody>';
                return;
            }
            for (const item of items) {
                const row = tbody.insertRow();
                row.insertCell(0).textContent = item.product_id;
                row.insertCell(1).textContent = item.typeName;
                row.insertCell(2).textContent = item.name;
                row.insertCell(3).textContent = item.price;
                row.insertCell(4).textContent = item.stock;
                row.insertCell(5).textContent = window.getManufacturerName ? window.getManufacturerName(item.manufacturer_id, window.manufacturers) : '';
                row.insertCell(6).textContent = item.genre_names || '—';
                let extraLines = [];
                if (item.type === 'ticket') {
                    extraLines.push(`Концерт: ${item.concert_title || item.concert_id}`);
                    if (item.price_category) extraLines.push(`Тип места: ${item.price_category}`);
                } else if (item.type === 'clothing') {
                    if (item.material) extraLines.push(`Материал: ${item.material}`);
                    if (item.color) extraLines.push(`Цвет: ${item.color}`);
                    if (item.size) extraLines.push(`Размер: ${item.size}`);
                    if (item.gender) extraLines.push(`Пол: ${item.gender}`);
                    if (item.artistNames) {
                        let artists = item.artistNames;
                        if (Array.isArray(artists)) artists = artists.join(', ');
                        if (artists && artists.trim()) extraLines.push(`Исполнители: ${artists}`);
                    }
                } else if (item.type === 'accessory') {
                    if (item.material) extraLines.push(`Материал: ${item.material}`);
                    if (item.color) extraLines.push(`Цвет: ${item.color}`);
                    if (item.accessory_type) extraLines.push(`Тип: ${item.accessory_type}`);
                    if (item.weight) extraLines.push(`Вес: ${item.weight} г`);
                    if (item.artistNames) {
                        let artists = item.artistNames;
                        if (Array.isArray(artists)) artists = artists.join(', ');
                        if (artists && artists.trim()) extraLines.push(`Исполнители: ${artists}`);
                    }
                }
                const extraCell = row.insertCell(7);
                extraCell.style.whiteSpace = 'pre-wrap';
                extraCell.textContent = extraLines.length ? extraLines.join('\n') : '—';
                const actions = row.insertCell(8);
                const topRow = document.createElement('div');
                topRow.className = 'action-buttons-row';
                const bottomRow = document.createElement('div');
                bottomRow.className = 'action-buttons-row';
                const inWishlist = window.userWishlistIds && window.userWishlistIds.includes(item.product_id);
                const wishBtn = document.createElement('button');
                wishBtn.textContent = '❤️';
                wishBtn.className = 'wishlist-btn' + (inWishlist ? ' active' : '');
                wishBtn.title = inWishlist ? 'Удалить из избранного' : 'В избранное';
                wishBtn.onclick = () => inWishlist ? window.removeFromWishlist?.(item.product_id) : window.addToWishlist?.(item.product_id, item.name);
                const cartBtn = document.createElement('button');
                cartBtn.textContent = '🛒';
                cartBtn.className = 'cart-btn';
                cartBtn.title = 'В корзину';
                cartBtn.onclick = () => {
                    window.currentProductForCart = { id: item.product_id, name: item.name };
                    window.showCartModal?.();
                };
                topRow.append(wishBtn, cartBtn);
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Редактировать';
                editBtn.className = 'edit-btn';
                editBtn.onclick = () => {
                    if (item.type === 'ticket' && window.fillEditTicketForm) window.fillEditTicketForm(item);
                    else if (item.type === 'clothing' && window.fillEditClothingForm) window.fillEditClothingForm(item);
                    else if (item.type === 'accessory' && window.fillEditAccessoryForm) window.fillEditAccessoryForm(item);
                };
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => {
                    if (item.type === 'ticket' && window.deleteTicket) window.deleteTicket(item.ticket_id, item.name);
                    else if (item.type === 'clothing' && window.deleteClothing) window.deleteClothing(item.clothing_id, item.name);
                    else if (item.type === 'accessory' && window.deleteAccessory) window.deleteAccessory(item.accessory_id, item.name);
                };
                bottomRow.append(editBtn, delBtn);
                actions.append(topRow, bottomRow);
            }
        } catch (err) {
            console.error(err);
            const tbody = document.getElementById('catalog-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="centered-message">Ошибка загрузки</tbody>';
        }
    }

    function refreshFilters() {
        if (typeof window.loadManufacturersForSelect === 'function') window.loadManufacturersForSelect('filter-manufacturer');
        render();
    }

    function hideEditPanel() {
        const editPanel = document.getElementById('edit-panel');
        if (editPanel) editPanel.style.display = 'none';
        const editForms = ['edit-ticket-form', 'edit-clothing-form', 'edit-accessory-form'];
        editForms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.style.display = 'none';
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.type !== 'button' && input.type !== 'submit') {
                        input.value = '';
                        if (typeof window.clearFieldValidity === 'function') window.clearFieldValidity(input);
                    }
                });
            }
        });
        if (typeof window.resetGlobalProductState === 'function') window.resetGlobalProductState();
    }

    return { render, refreshFilters, hideEditPanel };
})();