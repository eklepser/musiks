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
                const id = parseInt(btn.dataset.genreId);
                window.selectedGenresForTicket = window.selectedGenresForTicket.filter(gid => gid !== id);
                renderTicketSelectedGenres();
                renderEditTicketSelectedGenres();
                openTicketGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForTicket.includes(g.genre_id));
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
                const id = parseInt(btn.dataset.genreId);
                window.selectedGenresForClothing = window.selectedGenresForClothing.filter(gid => gid !== id);
                renderClothingSelectedGenres();
                renderEditClothingSelectedGenres();
                openClothingGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForClothing.includes(g.genre_id));
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
                const id = parseInt(btn.dataset.genreId);
                window.selectedGenresForAccessory = window.selectedGenresForAccessory.filter(gid => gid !== id);
                renderAccessorySelectedGenres();
                renderEditAccessorySelectedGenres();
                openAccessoryGenresModal();
            });
        });
    }
    const availableGenres = genres.filter(g => !window.selectedGenresForAccessory.includes(g.genre_id));
    genreSelect.innerHTML = '<option value="">-- Добавить жанр --</option>';
    availableGenres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre.genre_id;
        opt.textContent = genre.name;
        genreSelect.appendChild(opt);
    });
    modal.style.display = 'block';
}

function addTicketGenreFromModal() {
    const genreId = parseInt(document.getElementById('modal-genre-select').value);
    if (!genreId) return;
    if (!window.selectedGenresForTicket.includes(genreId)) {
        window.selectedGenresForTicket.push(genreId);
        renderTicketSelectedGenres();
        renderEditTicketSelectedGenres();
        openTicketGenresModal();
    } else {
        showToast('Жанр уже выбран', 'warning');
    }
}

function addClothingGenreFromModal() {
    const genreId = parseInt(document.getElementById('modal-genre-select').value);
    if (!genreId) return;
    if (!window.selectedGenresForClothing.includes(genreId)) {
        window.selectedGenresForClothing.push(genreId);
        renderClothingSelectedGenres();
        renderEditClothingSelectedGenres();
        openClothingGenresModal();
    } else {
        showToast('Жанр уже выбран', 'warning');
    }
}

function addAccessoryGenreFromModal() {
    const genreId = parseInt(document.getElementById('modal-genre-select').value);
    if (!genreId) return;
    if (!window.selectedGenresForAccessory.includes(genreId)) {
        window.selectedGenresForAccessory.push(genreId);
        renderAccessorySelectedGenres();
        renderEditAccessorySelectedGenres();
        openAccessoryGenresModal();
    } else {
        showToast('Жанр уже выбран', 'warning');
    }
}

function closeGenresModal() {
    const modal = document.getElementById('genres-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('open-ticket-genres-modal-btn')?.addEventListener('click', openTicketGenresModal);
document.getElementById('edit-ticket-genres-btn')?.addEventListener('click', openTicketGenresModal);
document.getElementById('open-clothing-genres-modal-btn')?.addEventListener('click', openClothingGenresModal);
document.getElementById('edit-clothing-genres-btn')?.addEventListener('click', openClothingGenresModal);
document.getElementById('open-accessory-genres-modal-btn')?.addEventListener('click', openAccessoryGenresModal);
document.getElementById('edit-accessory-genres-btn')?.addEventListener('click', openAccessoryGenresModal);

document.getElementById('modal-add-genre')?.addEventListener('click', () => {
    if (document.getElementById('open-ticket-genres-modal-btn')?.parentElement?.parentElement?.style.display !== 'none') {
        addTicketGenreFromModal();
    } else if (document.getElementById('open-clothing-genres-modal-btn')?.parentElement?.parentElement?.style.display !== 'none') {
        addClothingGenreFromModal();
    } else {
        addAccessoryGenreFromModal();
    }
});

document.getElementById('modal-genre-close')?.addEventListener('click', closeGenresModal);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('genres-modal');
    if (e.target === modal && modal) modal.style.display = 'none';
});

window.selectedGenresForTicket = window.selectedGenresForTicket || [];
window.selectedGenresForClothing = window.selectedGenresForClothing || [];
window.selectedGenresForAccessory = window.selectedGenresForAccessory || [];

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