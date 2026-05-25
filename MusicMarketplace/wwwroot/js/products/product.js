let activeGenreFormType = null;

function renderTicketSelectedGenres() {
    const container = document.getElementById('ticket-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForTicket || window.selectedGenresForTicket.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForTicket.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderEditTicketSelectedGenres() {
    const container = document.getElementById('edit-ticket-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForTicket || window.selectedGenresForTicket.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForTicket.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderClothingSelectedGenres() {
    const container = document.getElementById('clothing-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForClothing || window.selectedGenresForClothing.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForClothing.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderEditClothingSelectedGenres() {
    const container = document.getElementById('edit-clothing-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForClothing || window.selectedGenresForClothing.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForClothing.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderAccessorySelectedGenres() {
    const container = document.getElementById('accessory-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForAccessory || window.selectedGenresForAccessory.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForAccessory.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function renderEditAccessorySelectedGenres() {
    const container = document.getElementById('edit-accessory-selected-genres-list');
    if (!container) return;
    if (!window.selectedGenresForAccessory || window.selectedGenresForAccessory.length === 0) {
        container.innerHTML = '<span style="color: #999;">Жанры не выбраны</span>';
        return;
    }
    const names = window.selectedGenresForAccessory.map(id => {
        const genre = genres.find(g => g.genre_id === id);
        return genre ? genre.name : `ID ${id}`;
    });
    container.innerHTML = names.join(', ');
}

function openTicketGenresModal() {
    activeGenreFormType = 'ticket';
    const modal = document.getElementById('genres-modal');
    const genresListDiv = document.getElementById('modal-genres-list');
    const genreSelect = document.getElementById('modal-genre-select');
    if (!modal || !genresListDiv || !genreSelect) return;
    genresListDiv.innerHTML = '';
    if (!window.selectedGenresForTicket || window.selectedGenresForTicket.length === 0) {
        genresListDiv.innerHTML = '<p>Нет выбранных жанров</p>';
    } else {
        window.selectedGenresForTicket.forEach(genreId => {
            const genre = genres.find(g => g.genre_id === genreId);
            const name = genre ? genre.name : `ID ${genreId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-genre-from-modal" data-genre-id="${genreId}">Удалить</button>`;
            genresListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-genre-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.genreId, 10);
                window.selectedGenresForTicket = window.selectedGenresForTicket.filter(gid => gid !== id);
                renderTicketSelectedGenres();
                renderEditTicketSelectedGenres();
                openTicketGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForTicket.includes(Number(g.genre_id)));
    genreSelect.innerHTML = '<option value="">-- Добавить жанр --</option>';
    availableGenres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre.genre_id;
        opt.textContent = genre.name;
        genreSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function openClothingGenresModal() {
    activeGenreFormType = 'clothing';
    const modal = document.getElementById('genres-modal');
    const genresListDiv = document.getElementById('modal-genres-list');
    const genreSelect = document.getElementById('modal-genre-select');
    if (!modal || !genresListDiv || !genreSelect) return;
    genresListDiv.innerHTML = '';
    if (!window.selectedGenresForClothing || window.selectedGenresForClothing.length === 0) {
        genresListDiv.innerHTML = '<p>Нет выбранных жанров</p>';
    } else {
        window.selectedGenresForClothing.forEach(genreId => {
            const genre = genres.find(g => g.genre_id === genreId);
            const name = genre ? genre.name : `ID ${genreId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-genre-from-modal" data-genre-id="${genreId}">Удалить</button>`;
            genresListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-genre-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.genreId, 10);
                window.selectedGenresForClothing = window.selectedGenresForClothing.filter(gid => gid !== id);
                renderClothingSelectedGenres();
                renderEditClothingSelectedGenres();
                openClothingGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForClothing.includes(Number(g.genre_id)));
    genreSelect.innerHTML = '<option value="">-- Добавить жанр --</option>';
    availableGenres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre.genre_id;
        opt.textContent = genre.name;
        genreSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function openAccessoryGenresModal() {
    activeGenreFormType = 'accessory';
    const modal = document.getElementById('genres-modal');
    const genresListDiv = document.getElementById('modal-genres-list');
    const genreSelect = document.getElementById('modal-genre-select');
    if (!modal || !genresListDiv || !genreSelect) return;
    genresListDiv.innerHTML = '';
    if (!window.selectedGenresForAccessory || window.selectedGenresForAccessory.length === 0) {
        genresListDiv.innerHTML = '<p>Нет выбранных жанров</p>';
    } else {
        window.selectedGenresForAccessory.forEach(genreId => {
            const genre = genres.find(g => g.genre_id === genreId);
            const name = genre ? genre.name : `ID ${genreId}`;
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `${name} <button class="remove-genre-from-modal" data-genre-id="${genreId}">Удалить</button>`;
            genresListDiv.appendChild(div);
        });
        document.querySelectorAll('.remove-genre-from-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.genreId, 10);
                window.selectedGenresForAccessory = window.selectedGenresForAccessory.filter(gid => gid !== id);
                renderAccessorySelectedGenres();
                renderEditAccessorySelectedGenres();
                openAccessoryGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForAccessory.includes(Number(g.genre_id)));
    genreSelect.innerHTML = '<option value="">-- Добавить жанр --</option>';
    availableGenres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre.genre_id;
        opt.textContent = genre.name;
        genreSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function addGenreFromModal() {
    const genreId = parseInt(document.getElementById('modal-genre-select').value, 10);
    if (!genreId) return;

    let selectedArr, renderFn, editRenderFn, reopenFn;

    switch (activeGenreFormType) {
        case 'ticket':
            selectedArr = window.selectedGenresForTicket;
            renderFn = renderTicketSelectedGenres;
            editRenderFn = renderEditTicketSelectedGenres;
            reopenFn = openTicketGenresModal;
            break;
        case 'clothing':
            selectedArr = window.selectedGenresForClothing;
            renderFn = renderClothingSelectedGenres;
            editRenderFn = renderEditClothingSelectedGenres;
            reopenFn = openClothingGenresModal;
            break;
        case 'accessory':
            selectedArr = window.selectedGenresForAccessory;
            renderFn = renderAccessorySelectedGenres;
            editRenderFn = renderEditAccessorySelectedGenres;
            reopenFn = openAccessoryGenresModal;
            break;
        default:
            return;
    }

    if (!selectedArr.includes(genreId)) {
        selectedArr.push(genreId);
        if (typeof renderFn === 'function') renderFn();
        if (typeof editRenderFn === 'function') editRenderFn();
        if (typeof reopenFn === 'function') reopenFn();
    } else {
        showToast('Жанр уже выбран', 'warning');
    }
}

async function loadProductGenresForEdit(productId, productType) {
    try {
        const resp = await fetch(`${PRODUCT_GENRES_URL}`);
        if (resp.ok) {
            const links = await resp.json();
            const genreIds = links
                .filter(l => l.product_id === productId)
                .map(l => l.genre_id);

            if (productType === 'ticket') {
                window.selectedGenresForTicket = genreIds;
                if (typeof renderEditTicketSelectedGenres === 'function') renderEditTicketSelectedGenres();
            } else if (productType === 'clothing') {
                window.selectedGenresForClothing = genreIds;
                if (typeof renderEditClothingSelectedGenres === 'function') renderEditClothingSelectedGenres();
            } else if (productType === 'accessory') {
                window.selectedGenresForAccessory = genreIds;
                if (typeof renderEditAccessorySelectedGenres === 'function') renderEditAccessorySelectedGenres();
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки жанров:', e);
    }
}

function closeGenresModal() {
    activeGenreFormType = null;
    const modal = document.getElementById('genres-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('open-ticket-genres-modal-btn')?.addEventListener('click', openTicketGenresModal);
document.getElementById('edit-ticket-genres-btn')?.addEventListener('click', openTicketGenresModal);
document.getElementById('open-clothing-genres-modal-btn')?.addEventListener('click', openClothingGenresModal);
document.getElementById('edit-clothing-genres-btn')?.addEventListener('click', openClothingGenresModal);
document.getElementById('open-accessory-genres-modal-btn')?.addEventListener('click', openAccessoryGenresModal);
document.getElementById('edit-accessory-genres-btn')?.addEventListener('click', openAccessoryGenresModal);

document.getElementById('modal-add-genre')?.addEventListener('click', addGenreFromModal);
document.getElementById('modal-genre-close')?.addEventListener('click', closeGenresModal);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('genres-modal');
    if (e.target === modal && modal) modal.style.display = 'none';
});

window.selectedGenresForTicket = window.selectedGenresForTicket || [];
window.selectedGenresForClothing = window.selectedGenresForClothing || [];
window.selectedGenresForAccessory = window.selectedGenresForAccessory || [];