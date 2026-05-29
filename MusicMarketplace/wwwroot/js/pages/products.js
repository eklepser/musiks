(function () {
    let activeGenreFormType = null;
    function renderTicketSelectedGenres() {
        const container = document.getElementById('ticket-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForTicket || window.selectedGenresForTicket.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForTicket.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderEditTicketSelectedGenres() {
        const container = document.getElementById('edit-ticket-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForTicket || window.selectedGenresForTicket.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForTicket.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderClothingSelectedGenres() {
        const container = document.getElementById('clothing-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForClothing || window.selectedGenresForClothing.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForClothing.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderEditClothingSelectedGenres() {
        const container = document.getElementById('edit-clothing-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForClothing || window.selectedGenresForClothing.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForClothing.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderAccessorySelectedGenres() {
        const container = document.getElementById('accessory-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForAccessory || window.selectedGenresForAccessory.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForAccessory.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderEditAccessorySelectedGenres() {
        const container = document.getElementById('edit-accessory-selected-genres-list');
        if (!container) return;
        if (!window.selectedGenresForAccessory || window.selectedGenresForAccessory.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Жанры не выбраны</span>';
            return;
        }
        const names = window.selectedGenresForAccessory.map(id => {
            const genre = window.genres.find(g => g.genre_id === id);
            return genre ? genre.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderClothingSelectedArtists() {
        const container = document.getElementById('clothing-selected-artists-list');
        if (!container) return;
        if (!window.selectedArtistsForClothing || window.selectedArtistsForClothing.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
            return;
        }
        const names = window.selectedArtistsForClothing.map(id => {
            const artist = window.allArtists.find(a => a.artist_id === id);
            return artist ? artist.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderEditClothingSelectedArtists() {
        const container = document.getElementById('edit-clothing-selected-artists-list');
        if (!container) return;
        if (!window.selectedArtistsForClothing || window.selectedArtistsForClothing.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
            return;
        }
        const names = window.selectedArtistsForClothing.map(id => {
            const artist = window.allArtists.find(a => a.artist_id === id);
            return artist ? artist.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderAccessorySelectedArtists() {
        const container = document.getElementById('accessory-selected-artists-list');
        if (!container) return;
        if (!window.selectedArtistsForAccessory || window.selectedArtistsForAccessory.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
            return;
        }
        const names = window.selectedArtistsForAccessory.map(id => {
            const artist = window.allArtists.find(a => a.artist_id === id);
            return artist ? artist.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    function renderEditAccessorySelectedArtists() {
        const container = document.getElementById('edit-accessory-selected-artists-list');
        if (!container) return;
        if (!window.selectedArtistsForAccessory || window.selectedArtistsForAccessory.length === 0) {
            container.innerHTML = '<span class="placeholder-text">Исполнители не выбраны</span>';
            return;
        }
        const names = window.selectedArtistsForAccessory.map(id => {
            const artist = window.allArtists.find(a => a.artist_id === id);
            return artist ? artist.name : `ID ${id}`;
        });
        container.innerHTML = names.join(', ');
    }
    async function loadProductGenresForEdit(productId, productType) {
        try {
            const resp = await fetch(window.API_URLS.PRODUCT_GENRES);
            if (resp.ok) {
                const links = await resp.json();
                const genreIds = links.filter(l => l.product_id === productId).map(l => l.genre_id);
                if (productType === 'ticket') {
                    window.selectedGenresForTicket = genreIds;
                    renderEditTicketSelectedGenres();
                } else if (productType === 'clothing') {
                    window.selectedGenresForClothing = genreIds;
                    renderEditClothingSelectedGenres();
                } else if (productType === 'accessory') {
                    window.selectedGenresForAccessory = genreIds;
                    renderEditAccessorySelectedGenres();
                }
            }
        } catch (e) { console.error('Ошибка загрузки жанров:', e); }
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
                const genre = window.genres.find(g => g.genre_id === genreId);
                const name = genre ? genre.name : `ID ${genreId}`;
                const div = document.createElement('div');
                div.className = 'selected-genre-item';
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
        const availableGenres = window.genres.filter(g => !window.selectedGenresForTicket.includes(Number(g.genre_id)));
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
                const genre = window.genres.find(g => g.genre_id === genreId);
                const name = genre ? genre.name : `ID ${genreId}`;
                const div = document.createElement('div');
                div.className = 'selected-genre-item';
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
        const availableGenres = window.genres.filter(g => !window.selectedGenresForClothing.includes(Number(g.genre_id)));
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
                const genre = window.genres.find(g => g.genre_id === genreId);
                const name = genre ? genre.name : `ID ${genreId}`;
                const div = document.createElement('div');
                div.className = 'selected-genre-item';
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
        const availableGenres = window.genres.filter(g => !window.selectedGenresForAccessory.includes(Number(g.genre_id)));
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
            default: return;
        }
        if (!selectedArr.includes(genreId)) {
            selectedArr.push(genreId);
            if (typeof renderFn === 'function') renderFn();
            if (typeof editRenderFn === 'function') editRenderFn();
            if (typeof reopenFn === 'function') reopenFn();
        } else {
            window.showToast('Жанр уже выбран', 'warning');
        }
    }
    function closeGenresModal() {
        activeGenreFormType = null;
        const modal = document.getElementById('genres-modal');
        if (modal) modal.style.display = 'none';
    }
    async function openClothingArtistsModal() {
        if (!window.allArtists || window.allArtists.length === 0) {
            const resp = await fetch(window.API_URLS.ARTISTS);
            if (resp.ok) window.allArtists = await resp.json();
        }
        const modal = document.getElementById('artists-merch-modal');
        const artistsListDiv = document.getElementById('modal-merch-artists-list');
        const artistSelect = document.getElementById('modal-merch-artist-select');
        if (!modal || !artistsListDiv || !artistSelect) return;
        artistsListDiv.innerHTML = '';
        if (!window.selectedArtistsForClothing || window.selectedArtistsForClothing.length === 0) {
            artistsListDiv.innerHTML = '<p>Нет выбранных исполнителей</p>';
        } else {
            window.selectedArtistsForClothing.forEach(artistId => {
                const artist = window.allArtists.find(a => a.artist_id === artistId);
                const name = artist ? artist.name : `ID ${artistId}`;
                const div = document.createElement('div');
                div.className = 'selected-artist-item';
                div.innerHTML = `${name} <button class="remove-clothing-artist-from-modal" data-artist-id="${artistId}">Удалить</button>`;
                artistsListDiv.appendChild(div);
            });
            document.querySelectorAll('.remove-clothing-artist-from-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.artistId);
                    window.selectedArtistsForClothing = window.selectedArtistsForClothing.filter(aid => aid !== id);
                    renderClothingSelectedArtists();
                    renderEditClothingSelectedArtists();
                    openClothingArtistsModal();
                });
            });
        }
        const availableArtists = window.allArtists.filter(a => !window.selectedArtistsForClothing.includes(a.artist_id));
        artistSelect.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
        availableArtists.forEach(artist => {
            const opt = document.createElement('option');
            opt.value = artist.artist_id;
            opt.textContent = artist.name;
            artistSelect.appendChild(opt);
        });
        modal.style.display = 'block';
    }
    async function openAccessoryArtistsModal() {
        if (!window.allArtists || window.allArtists.length === 0) {
            const resp = await fetch(window.API_URLS.ARTISTS);
            if (resp.ok) window.allArtists = await resp.json();
        }
        const modal = document.getElementById('artists-merch-modal');
        const artistsListDiv = document.getElementById('modal-merch-artists-list');
        const artistSelect = document.getElementById('modal-merch-artist-select');
        if (!modal || !artistsListDiv || !artistSelect) return;
        artistsListDiv.innerHTML = '';
        if (!window.selectedArtistsForAccessory || window.selectedArtistsForAccessory.length === 0) {
            artistsListDiv.innerHTML = '<p>Нет выбранных исполнителей</p>';
        } else {
            window.selectedArtistsForAccessory.forEach(artistId => {
                const artist = window.allArtists.find(a => a.artist_id === artistId);
                const name = artist ? artist.name : `ID ${artistId}`;
                const div = document.createElement('div');
                div.className = 'selected-artist-item';
                div.innerHTML = `${name} <button class="remove-accessory-artist-from-modal" data-artist-id="${artistId}">Удалить</button>`;
                artistsListDiv.appendChild(div);
            });
            document.querySelectorAll('.remove-accessory-artist-from-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.artistId);
                    window.selectedArtistsForAccessory = window.selectedArtistsForAccessory.filter(aid => aid !== id);
                    renderAccessorySelectedArtists();
                    renderEditAccessorySelectedArtists();
                    openAccessoryArtistsModal();
                });
            });
        }
        const availableArtists = window.allArtists.filter(a => !window.selectedArtistsForAccessory.includes(a.artist_id));
        artistSelect.innerHTML = '<option value="">-- Добавить исполнителя --</option>';
        availableArtists.forEach(artist => {
            const opt = document.createElement('option');
            opt.value = artist.artist_id;
            opt.textContent = artist.name;
            artistSelect.appendChild(opt);
        });
        modal.style.display = 'block';
    }
    function addClothingArtistFromModal() {
        const artistId = parseInt(document.getElementById('modal-merch-artist-select').value);
        if (!artistId) return;
        if (!window.selectedArtistsForClothing.includes(artistId)) {
            window.selectedArtistsForClothing.push(artistId);
            renderClothingSelectedArtists();
            renderEditClothingSelectedArtists();
            openClothingArtistsModal();
        } else {
            window.showToast('Исполнитель уже выбран', 'warning');
        }
    }
    function addAccessoryArtistFromModal() {
        const artistId = parseInt(document.getElementById('modal-merch-artist-select').value);
        if (!artistId) return;
        if (!window.selectedArtistsForAccessory.includes(artistId)) {
            window.selectedArtistsForAccessory.push(artistId);
            renderAccessorySelectedArtists();
            renderEditAccessorySelectedArtists();
            openAccessoryArtistsModal();
        } else {
            window.showToast('Исполнитель уже выбран', 'warning');
        }
    }
    function closeArtistsMerchModal() {
        const modal = document.getElementById('artists-merch-modal');
        if (modal) modal.style.display = 'none';
    }
    function initLiveValidation() {
        const validators = {
            name: (v) => window.validateRequiredString(v, 'Название', 2, 200, true),
            price: (v) => window.validatePrice(v, true),
            stock: (v) => window.validateStock(v, false),
            manufacturer: (v) => v ? null : 'Выберите производителя',
            concert: (v) => v ? null : 'Выберите концерт',
            material: (v) => v && v.trim() ? (window.validateNoLeadingDigit(v, 'Материал') || window.validateOptionalString(v, 'Материал', 50, 2)) : null,
            color: (v) => v && v.trim() ? window.validateAlphabeticWithSpaces(v, 'Цвет', 3, 30, false) : null,
            type: (v) => v && v.trim() ? window.validateAlphabeticWithSpaces(v, 'Тип аксессуара', 3, 50, false) : null,
            weight: (v) => v && v.trim() ? window.validatePositiveNumber(v, 'Вес', false) : null,
            description: (v) => v && v.trim() ? (window.validateNoLeadingDigit(v, 'Описание') || window.validateOptionalString(v, 'Описание', 1000, 10)) : null,
            priceCategory: (v) => v && v.trim() ? window.validateAlphabeticWithSpaces(v, 'Тип места', 3, 30, false) : null
        };
        const forms = ['ticket', 'clothing', 'accessory'];
        forms.forEach(type => {
            const fields = [
                { id: `${type}-name`, validator: validators.name, required: true },
                { id: `${type}-price`, validator: validators.price, required: true },
                { id: `${type}-stock`, validator: validators.stock, required: false },
                { id: `${type}-manufacturer-id`, validator: validators.manufacturer, required: true },
                { id: `${type}-description`, validator: validators.description, required: false }
            ];
            if (type === 'ticket') {
                fields.push({ id: `${type}-concert-id`, validator: validators.concert, required: true });
                fields.push({ id: `${type}-price-category`, validator: validators.priceCategory, required: false });
            }
            if (type === 'clothing') {
                fields.push({ id: `${type}-material`, validator: validators.material, required: false });
                fields.push({ id: `${type}-color`, validator: validators.color, required: false });
            }
            if (type === 'accessory') {
                fields.push({ id: `${type}-material`, validator: validators.material, required: false });
                fields.push({ id: `${type}-color`, validator: validators.color, required: false });
                fields.push({ id: `${type}-type`, validator: validators.type, required: false });
                fields.push({ id: `${type}-weight`, validator: validators.weight, required: false });
            }
            fields.forEach(f => {
                const el = document.getElementById(f.id);
                if (el && typeof window.attachLiveValidation === 'function') {
                    window.attachLiveValidation(el, f.validator, f.required);
                }
            });
        });
        const editForms = ['ticket', 'clothing', 'accessory'];
        editForms.forEach(type => {
            const fields = [
                { id: `edit-${type}-name`, validator: validators.name, required: true },
                { id: `edit-${type}-price`, validator: validators.price, required: true },
                { id: `edit-${type}-stock`, validator: validators.stock, required: false },
                { id: `edit-${type}-manufacturer-id`, validator: validators.manufacturer, required: true },
                { id: `edit-${type}-description`, validator: validators.description, required: false }
            ];
            if (type === 'ticket') {
                fields.push({ id: `edit-${type}-concert-id`, validator: validators.concert, required: true });
                fields.push({ id: `edit-${type}-price-category`, validator: validators.priceCategory, required: false });
            }
            if (type === 'clothing') {
                fields.push({ id: `edit-${type}-material`, validator: validators.material, required: false });
                fields.push({ id: `edit-${type}-color`, validator: validators.color, required: false });
            }
            if (type === 'accessory') {
                fields.push({ id: `edit-${type}-material`, validator: validators.material, required: false });
                fields.push({ id: `edit-${type}-color`, validator: validators.color, required: false });
                fields.push({ id: `edit-${type}-type`, validator: validators.type, required: false });
                fields.push({ id: `edit-${type}-weight`, validator: validators.weight, required: false });
            }
            fields.forEach(f => {
                const el = document.getElementById(f.id);
                if (el && typeof window.attachLiveValidation === 'function') {
                    window.attachLiveValidation(el, f.validator, f.required);
                }
            });
        });
    }
    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-listener')) return;
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const activeTab = document.getElementById(`${tabName}-tab`);
                if (activeTab) activeTab.classList.add('active');
                if (tabName === 'catalog') {
                    if (window.Catalog) window.Catalog.render();
                } else if (tabName === 'add') {
                    if (typeof window.resetGlobalProductState === 'function') window.resetGlobalProductState();
                    if (typeof window.clearClothingForm === 'function') window.clearClothingForm();
                    if (typeof window.clearAccessoryForm === 'function') window.clearAccessoryForm();
                    if (typeof window.clearTicketForm === 'function') window.clearTicketForm();
                    if (typeof window.loadManufacturersForSelect === 'function') {
                        window.loadManufacturersForSelect('ticket-manufacturer-id');
                        window.loadManufacturersForSelect('clothing-manufacturer-id');
                        window.loadManufacturersForSelect('accessory-manufacturer-id');
                    }
                    if (typeof window.loadConcertsSelect === 'function') window.loadConcertsSelect('ticket-concert-id');
                } else if (tabName === 'manufacturers') {
                    if (typeof window.loadManufacturersTable === 'function') await window.loadManufacturersTable();
                } else if (tabName === 'genres') {
                    if (typeof window.loadGenresTable === 'function') await window.loadGenresTable();
                }
                setTimeout(function () {
                    if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
                    if (typeof window.initToggleAddSections === 'function') window.initToggleAddSections();
                }, 50);
            });
        });
    }
    document.addEventListener('DOMContentLoaded', async () => {
        window.selectedGenresForTicket = [];
        window.selectedGenresForClothing = [];
        window.selectedGenresForAccessory = [];
        window.selectedArtistsForClothing = [];
        window.selectedArtistsForAccessory = [];
        window.renderTicketSelectedGenres = renderTicketSelectedGenres;
        window.renderEditTicketSelectedGenres = renderEditTicketSelectedGenres;
        window.renderClothingSelectedGenres = renderClothingSelectedGenres;
        window.renderEditClothingSelectedGenres = renderEditClothingSelectedGenres;
        window.renderAccessorySelectedGenres = renderAccessorySelectedGenres;
        window.renderEditAccessorySelectedGenres = renderEditAccessorySelectedGenres;
        window.renderClothingSelectedArtists = renderClothingSelectedArtists;
        window.renderEditClothingSelectedArtists = renderEditClothingSelectedArtists;
        window.renderAccessorySelectedArtists = renderAccessorySelectedArtists;
        window.renderEditAccessorySelectedArtists = renderEditAccessorySelectedArtists;
        window.openTicketGenresModal = openTicketGenresModal;
        window.openClothingGenresModal = openClothingGenresModal;
        window.openAccessoryGenresModal = openAccessoryGenresModal;
        window.addGenreFromModal = addGenreFromModal;
        window.closeGenresModal = closeGenresModal;
        window.openClothingArtistsModal = openClothingArtistsModal;
        window.openAccessoryArtistsModal = openAccessoryArtistsModal;
        window.addClothingArtistFromModal = addClothingArtistFromModal;
        window.addAccessoryArtistFromModal = addAccessoryArtistFromModal;
        window.closeArtistsMerchModal = closeArtistsMerchModal;
        await Promise.all([
            (async () => {
                const resp = await fetch(window.API_URLS.ARTISTS);
                if (resp.ok) window.allArtists = await resp.json();
            })(),
            (async () => {
                const resp = await fetch(window.API_URLS.MANUFACTURERS);
                if (resp.ok) window.manufacturers = await resp.json();
            })(),
            (async () => {
                const resp = await fetch(window.API_URLS.GENRES);
                if (resp.ok) window.genres = await resp.json();
            })()
        ]);
        window.loadAllItems = () => { if (window.Catalog) window.Catalog.render(); };
        window.renderCatalog = () => { if (window.Catalog) window.Catalog.render(); };
        window.refreshCatalogFilters = () => { if (window.Catalog) window.Catalog.refreshFilters(); };
        window.hideEditPanel = () => { if (window.Catalog) window.Catalog.hideEditPanel(); };
        window.resetGlobalProductState = () => window.ProductForms.resetState();
        window.saveTicket = () => window.ProductForms.save('ticket');
        window.saveClothing = () => window.ProductForms.save('clothing');
        window.saveAccessory = () => window.ProductForms.save('accessory');
        window.clearTicketForm = () => window.ProductForms.clearForm('ticket');
        window.clearClothingForm = () => window.ProductForms.clearForm('clothing');
        window.clearAccessoryForm = () => window.ProductForms.clearForm('accessory');
        window.saveEditTicket = () => window.ProductForms.save('ticket');
        window.saveEditClothing = () => window.ProductForms.save('clothing');
        window.saveEditAccessory = () => window.ProductForms.save('accessory');
        window.fillEditTicketForm = (item) => {
            loadProductGenresForEdit(item.product_id, 'ticket');
            window.ProductForms.fillEditForm(item, 'ticket');
        };
        window.fillEditClothingForm = (item) => {
            loadProductGenresForEdit(item.product_id, 'clothing');
            window.ProductForms.fillEditForm(item, 'clothing');
        };
        window.fillEditAccessoryForm = (item) => {
            loadProductGenresForEdit(item.product_id, 'accessory');
            window.ProductForms.fillEditForm(item, 'accessory');
        };
        window.deleteTicket = (id, name) => window.ProductForms.deleteItem(id, name, 'ticket');
        window.deleteClothing = (id, name) => window.ProductForms.deleteItem(id, name, 'clothing');
        window.deleteAccessory = (id, name) => window.ProductForms.deleteItem(id, name, 'accessory');
        if (typeof window.loadManufacturersForSelect === 'function') {
            window.loadManufacturersForSelect('filter-manufacturer');
            window.loadManufacturersForSelect('edit-ticket-manufacturer-id');
            window.loadManufacturersForSelect('edit-clothing-manufacturer-id');
            window.loadManufacturersForSelect('edit-accessory-manufacturer-id');
            window.loadManufacturersForSelect('ticket-manufacturer-id');
            window.loadManufacturersForSelect('clothing-manufacturer-id');
            window.loadManufacturersForSelect('accessory-manufacturer-id');
        }
        if (typeof window.loadConcertsSelect === 'function') {
            window.loadConcertsSelect('edit-ticket-concert-id');
            window.loadConcertsSelect('ticket-concert-id');
        }
        if (typeof window.loadManufacturersTable === 'function') {
            await window.loadManufacturersTable();
            if (typeof window.ManufacturerForm?.initLiveValidation === 'function') window.ManufacturerForm.initLiveValidation();
        }
        if (typeof window.loadGenresTable === 'function') {
            await window.loadGenresTable();
            if (typeof window.GenreForm?.initLiveValidation === 'function') window.GenreForm.initLiveValidation();
        }
        if (window.Catalog) window.Catalog.render();
        initLiveValidation();
        document.getElementById('manufacturer-submit')?.addEventListener('click', () => window.ManufacturerForm.save());
        document.getElementById('manufacturer-cancel')?.addEventListener('click', () => window.ManufacturerForm.clearForm());
        document.getElementById('manufacturer-apply-filters')?.addEventListener('click', () => window.ManufacturerForm.loadTable());
        document.getElementById('manufacturer-clear-filters')?.addEventListener('click', () => {
            document.getElementById('manufacturer-search-name').value = '';
            document.getElementById('manufacturer-search-country').value = '';
            document.getElementById('manufacturer-sort').value = 'name_asc';
            window.ManufacturerForm.loadTable();
        });
        document.getElementById('genre-submit')?.addEventListener('click', () => window.GenreForm.save());
        document.getElementById('genre-cancel')?.addEventListener('click', () => window.GenreForm.clearForm());
        document.getElementById('genre-apply-filters')?.addEventListener('click', () => window.GenreForm.loadTable());
        document.getElementById('genre-clear-filters')?.addEventListener('click', () => {
            document.getElementById('genre-search-name').value = '';
            document.getElementById('genre-sort').value = 'name_asc';
            window.GenreForm.loadTable();
        });
        document.getElementById('ticket-submit')?.addEventListener('click', window.saveTicket);
        document.getElementById('ticket-cancel')?.addEventListener('click', window.clearTicketForm);
        document.getElementById('clothing-submit')?.addEventListener('click', window.saveClothing);
        document.getElementById('clothing-cancel')?.addEventListener('click', window.clearClothingForm);
        document.getElementById('accessory-submit')?.addEventListener('click', window.saveAccessory);
        document.getElementById('accessory-cancel')?.addEventListener('click', window.clearAccessoryForm);
        document.getElementById('apply-filters')?.addEventListener('click', () => { if (window.Catalog) window.Catalog.render(); });
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            document.getElementById('search-name').value = '';
            document.getElementById('filter-type').value = '';
            document.getElementById('filter-manufacturer').value = '';
            document.getElementById('filter-artist').value = '';
            document.getElementById('filter-in-stock').checked = false;
            document.getElementById('price-min').value = '';
            document.getElementById('price-max').value = '';
            document.getElementById('genre-select').value = '';
            document.getElementById('sort-by').value = '';
            if (window.Catalog) window.Catalog.render();
        });
        document.getElementById('edit-ticket-submit')?.addEventListener('click', window.saveEditTicket);
        document.getElementById('edit-ticket-cancel')?.addEventListener('click', window.hideEditPanel);
        document.getElementById('edit-clothing-submit')?.addEventListener('click', window.saveEditClothing);
        document.getElementById('edit-clothing-cancel')?.addEventListener('click', window.hideEditPanel);
        document.getElementById('edit-accessory-submit')?.addEventListener('click', window.saveEditAccessory);
        document.getElementById('edit-accessory-cancel')?.addEventListener('click', window.hideEditPanel);
        document.getElementById('open-ticket-genres-modal-btn')?.addEventListener('click', window.openTicketGenresModal);
        document.getElementById('edit-ticket-genres-btn')?.addEventListener('click', window.openTicketGenresModal);
        document.getElementById('open-clothing-genres-modal-btn')?.addEventListener('click', window.openClothingGenresModal);
        document.getElementById('edit-clothing-genres-btn')?.addEventListener('click', window.openClothingGenresModal);
        document.getElementById('open-accessory-genres-modal-btn')?.addEventListener('click', window.openAccessoryGenresModal);
        document.getElementById('edit-accessory-genres-btn')?.addEventListener('click', window.openAccessoryGenresModal);
        document.getElementById('edit-clothing-artists-btn')?.addEventListener('click', window.openClothingArtistsModal);
        document.getElementById('edit-accessory-artists-btn')?.addEventListener('click', window.openAccessoryArtistsModal);
        document.getElementById('open-clothing-artists-modal-btn')?.addEventListener('click', window.openClothingArtistsModal);
        document.getElementById('open-accessory-artists-modal-btn')?.addEventListener('click', window.openAccessoryArtistsModal);
        document.getElementById('modal-add-genre')?.addEventListener('click', window.addGenreFromModal);
        document.getElementById('modal-genre-close')?.addEventListener('click', window.closeGenresModal);
        document.getElementById('modal-merch-add-artist')?.addEventListener('click', () => {
            if (window.selectedArtistsForClothing && document.getElementById('open-clothing-artists-modal-btn')) {
                window.addClothingArtistFromModal();
            } else if (window.selectedArtistsForAccessory && document.getElementById('open-accessory-artists-modal-btn')) {
                window.addAccessoryArtistFromModal();
            }
        });
        document.getElementById('modal-merch-close')?.addEventListener('click', window.closeArtistsMerchModal);
        initTabs();
        if (typeof window.loadUserStatus === 'function') {
            window.loadUserStatus();
        }
    });
})();