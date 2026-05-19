// main.js
document.getElementById('ticket-submit').addEventListener('click', saveTicket);
document.getElementById('ticket-cancel').addEventListener('click', clearTicketForm);
document.getElementById('clothing-submit').addEventListener('click', saveClothing);
document.getElementById('clothing-cancel').addEventListener('click', clearClothingForm);
document.getElementById('accessory-submit').addEventListener('click', saveAccessory);
document.getElementById('accessory-cancel').addEventListener('click', clearAccessoryForm);
document.getElementById('manufacturer-submit').addEventListener('click', saveManufacturer);
document.getElementById('manufacturer-cancel').addEventListener('click', clearManufacturerForm);
document.getElementById('genre-submit').addEventListener('click', saveGenre);
document.getElementById('genre-cancel').addEventListener('click', clearGenreForm);
document.getElementById('apply-filters').addEventListener('click', () => renderCatalog());
document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-name').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-manufacturer').value = '';
    document.querySelectorAll('.genre-checkbox').forEach(cb => cb.checked = false);
    renderCatalog();
});
document.getElementById('edit-ticket-submit').addEventListener('click', saveEditTicket);
document.getElementById('edit-ticket-cancel').addEventListener('click', () => hideEditPanel());
document.getElementById('edit-clothing-submit').addEventListener('click', saveEditClothing);
document.getElementById('edit-clothing-cancel').addEventListener('click', () => hideEditPanel());
document.getElementById('edit-accessory-submit').addEventListener('click', saveEditAccessory);
document.getElementById('edit-accessory-cancel').addEventListener('click', () => hideEditPanel());
document.getElementById('edit-clothing-artists-btn').addEventListener('click', () => {
    const pid = document.getElementById('edit-clothing-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('edit-accessory-artists-btn').addEventListener('click', () => {
    const pid = document.getElementById('edit-accessory-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('add-clothing-artists-btn').addEventListener('click', () => {
    const pid = document.getElementById('add-clothing-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('add-accessory-artists-btn').addEventListener('click', () => {
    const pid = document.getElementById('add-accessory-artists-btn').getAttribute('data-product-id');
    if (pid) openProductArtistsModal(parseInt(pid));
});
document.getElementById('product-artist-add').addEventListener('click', addProductArtist);
document.getElementById('product-artist-close').addEventListener('click', () => {
    document.getElementById('product-artists-modal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    const modal = document.getElementById('product-artists-modal');
    if (e.target === modal) modal.style.display = 'none';
});

document.getElementById('cart-confirm-btn').addEventListener('click', () => {
    if (currentProductForCart) {
        const quantity = parseInt(document.getElementById('cart-quantity').value);
        addToCart(currentProductForCart.id, currentProductForCart.name, quantity);
        hideCartModal();
    }
});
document.getElementById('cart-cancel-btn').addEventListener('click', hideCartModal);
document.getElementById('review-confirm-btn').addEventListener('click', () => {
    if (currentProductForReview) {
        const rating = parseInt(document.getElementById('review-rating').value);
        const reviewText = document.getElementById('review-text').value;
        addReview(currentProductForReview.id, currentProductForReview.name, rating, reviewText);
        hideReviewModal();
    }
});
document.getElementById('review-cancel-btn').addEventListener('click', hideReviewModal);

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = `${btn.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
        if (btn.dataset.tab === 'catalog') {
            refreshCatalogFilters();
            hideEditPanel();
        } else if (btn.dataset.tab === 'add') {
            loadManufacturersForSelect('ticket-manufacturer-id');
            loadManufacturersForSelect('clothing-manufacturer-id');
            loadManufacturersForSelect('accessory-manufacturer-id');
            loadConcertsSelect('ticket-concert-id');
        } else if (btn.dataset.tab === 'manufacturers') {
            loadManufacturersTable();
        } else if (btn.dataset.tab === 'genres') {
            loadGenresTable();
        }
    });
});

function highlightActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentPath === href || (href !== 'index.html' && currentPath.endsWith(href)))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function loadUsersAndInit() {
    const select = document.getElementById('user-select');
    if (!select) return;
    fetch('https://localhost:7062/api/Users')
        .then(resp => resp.json())
        .then(users => {
            select.innerHTML = '<option value="">-- Выберите пользователя --</option>';
            users.forEach(user => {
                const opt = document.createElement('option');
                opt.value = user.user_id;
                opt.textContent = `${user.full_name} (${user.login})`;
                select.appendChild(opt);
            });
            const savedId = localStorage.getItem('currentUserId');
            if (savedId) select.value = savedId;
            if (select.value) {
                const userId = parseInt(select.value);
                fetch(`https://localhost:7062/api/Users/${userId}`)
                    .then(resp => resp.json())
                    .then(user => {
                        localStorage.setItem('currentUserId', userId);
                        if (typeof showToast === 'function') showToast(`Выбран пользователь: ${user.full_name}`, 'success');
                        loadUserStatus();
                    })
                    .catch(err => console.error(err));
            } else {
                loadUserStatus();
            }
        })
        .catch(err => console.error(err));
    select.addEventListener('change', (e) => {
        const userId = parseInt(e.target.value);
        if (!userId) {
            localStorage.removeItem('currentUserId');
            loadUserStatus();
            return;
        }
        fetch(`https://localhost:7062/api/Users/${userId}`)
            .then(resp => resp.json())
            .then(user => {
                localStorage.setItem('currentUserId', userId);
                if (typeof showToast === 'function') showToast(`Выбран пользователь: ${user.full_name}`, 'success');
                loadUserStatus();
            })
            .catch(err => console.error(err));
    });
}

loadAllItems();
loadManufacturersForSelect('filter-manufacturer');
loadGenresAndLinks();
loadManufacturersForSelect('edit-ticket-manufacturer-id');
loadManufacturersForSelect('edit-clothing-manufacturer-id');
loadManufacturersForSelect('edit-accessory-manufacturer-id');
loadConcertsSelect('edit-ticket-concert-id');
loadManufacturersForSelect('ticket-manufacturer-id');
loadManufacturersForSelect('clothing-manufacturer-id');
loadManufacturersForSelect('accessory-manufacturer-id');
loadConcertsSelect('ticket-concert-id');
loadManufacturersTable();
loadGenresTable();

highlightActiveNavItem();
loadUsersAndInit();