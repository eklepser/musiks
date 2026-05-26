async function loadAllItems() {
   await renderCatalog();
    }
async function getProductGenreNames(productId) {
    try {
        const resp = await fetch(PRODUCT_GENRES_URL);
        if (resp.ok) {
            const links = await resp.json();
            const productLinks = links.filter(l => l.product_id === productId);
            const genreNames = productLinks.map(l => l.genre_name);
            return genreNames.join(', ');
        }
    } catch (e) {
        console.error(e);
    }
    return '';
}
async function renderCatalog() {
    const searchName = document.getElementById('search-name').value.trim();
    const filterType = document.getElementById('filter-type').value;
    const filterManufacturerId = document.getElementById('filter-manufacturer').value;
    const filterArtistId = document.getElementById('filter-artist').value;
    const filterInStock = document.getElementById('filter-in-stock').checked;
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const sortBy = document.getElementById('sort-by').value;
    const selectedGenres = getSelectedGenres();
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
    const url = `${PRODUCTS_FILTER_URL}?${params.join('&')}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const items = await resp.json();
        const typeOrder = { 'clothing': 1, 'accessory': 2, 'ticket': 3 };
        items.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
        const countSpan = document.getElementById('found-count');
        if (countSpan) countSpan.innerText = items.length;
        const tbody = document.getElementById('catalog-tbody');
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="centered-message">Нет данных</td></tr>';
            return;
        }
        for (const item of items) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.product_id;
            row.insertCell(1).textContent = item.typeName;
            row.insertCell(2).textContent = item.name;
            row.insertCell(3).textContent = item.price;
            row.insertCell(4).textContent = item.stock;
            row.insertCell(5).textContent = getManufacturerName(item.manufacturer_id);
            let genresText = await getProductGenreNames(item.product_id);
            if (!genresText) genresText = '—';
            row.insertCell(6).textContent = genresText;
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
            const extraText = extraLines.length ? extraLines.join('\n') : '—';
            const extraCell = row.insertCell(7);
            extraCell.style.whiteSpace = 'pre-wrap';
            extraCell.textContent = extraText;
            const actions = row.insertCell(8);
            const topRow = document.createElement('div');
            topRow.className = 'action-buttons-row';
            const bottomRow = document.createElement('div');
            bottomRow.className = 'action-buttons-row';
            const inWishlist = userWishlistIds && userWishlistIds.includes(item.product_id);
            const wishBtn = document.createElement('button');
            wishBtn.textContent = '❤️';
            if (inWishlist) {
                wishBtn.style.background = '#dc3545';
                wishBtn.title = 'Удалить из вишлиста';
                wishBtn.onclick = () => { if (typeof removeFromWishlist === 'function') removeFromWishlist(item.product_id); };
            } else {
                wishBtn.style.background = '#ffc107';
                wishBtn.title = 'В вишлист';
                wishBtn.onclick = () => { if (typeof addToWishlist === 'function') addToWishlist(item.product_id, item.name); };
            }
            const inCart = userCartIds && userCartIds.includes(item.product_id);
            const cartBtn = document.createElement('button');
            cartBtn.textContent = '🛒';
            if (inCart) {
                cartBtn.style.background = '#28a745';
                cartBtn.title = 'Удалить из корзины';
                cartBtn.onclick = () => { if (typeof showRemoveFromCartModal === 'function') showRemoveFromCartModal(item.product_id, item.name); };
            } else {
                cartBtn.style.background = '#28a745';
                cartBtn.title = 'В корзину';
                cartBtn.onclick = () => { if (typeof showCartModal === 'function') { currentProductForCart = { id: item.product_id, name: item.name }; showCartModal(); } };
            }
            topRow.append(wishBtn, cartBtn);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => {
                if (item.type === 'ticket' && typeof fillEditTicketForm === 'function') fillEditTicketForm(item);
                else if (item.type === 'clothing' && typeof fillEditClothingForm === 'function') fillEditClothingForm(item);
                else if (item.type === 'accessory' && typeof fillEditAccessoryForm === 'function') fillEditAccessoryForm(item);
                document.getElementById('edit-panel').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => {
                if (item.type === 'ticket' && typeof deleteTicket === 'function') deleteTicket(item.ticket_id, item.name);
                else if (item.type === 'clothing' && typeof deleteClothing === 'function') deleteClothing(item.clothing_id, item.name);
                else if (item.type === 'accessory' && typeof deleteAccessory === 'function') deleteAccessory(item.accessory_id, item.name);
            };
            bottomRow.append(editBtn, delBtn);
            actions.append(topRow, bottomRow);
        }
    } catch (err) {
        console.error(err);
        document.getElementById('catalog-tbody').innerHTML = '<tr><td colspan="9" class="centered-message">Ошибка загрузки</td></tr>';
    }
}
function refreshCatalogFilters() {
    if (typeof loadManufacturersForSelect === 'function') loadManufacturersForSelect('filter-manufacturer');
    renderCatalog();
}
function hideEditPanel() {
    document.getElementById('edit-panel').style.display = 'none';
    document.getElementById('edit-ticket-form').style.display = 'none';
    document.getElementById('edit-clothing-form').style.display = 'none';
    document.getElementById('edit-accessory-form').style.display = 'none';
}
async function loadProductNameDatalist() {
    const resp = await fetch(`${PRODUCTS_FILTER_URL}/names`);
    if (resp.ok) {
        const names = await resp.json();
        const datalist = document.getElementById('product-name-datalist');
        if (datalist) {
            datalist.innerHTML = '';
            names.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
        }
    }
}
async function loadArtistsForSelect() {
    const resp = await fetch(ARTISTS_URL);
    if (resp.ok) {
        const artists = await resp.json();
        const select = document.getElementById('filter-artist');
        if (select) {
            select.innerHTML = '<option value="">Все артисты</option>';
            artists.forEach(artist => {
                const opt = document.createElement('option');
                opt.value = artist.artist_id;
                opt.textContent = artist.name;
                select.appendChild(opt);
            });
        }
    }
}
document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-name').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-manufacturer').value = '';
    document.getElementById('filter-artist').value = '';
    document.getElementById('filter-in-stock').checked = false;
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('genre-select').value = '';
    document.getElementById('sort-by').value = '';
    renderCatalog();
});
loadProductNameDatalist();
loadArtistsForSelect();