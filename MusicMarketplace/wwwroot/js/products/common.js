const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const CLOTHINGS_URL = 'https://localhost:7062/api/Clothings';
const ACCESSORIES_URL = 'https://localhost:7062/api/Accessories';
const PRODUCTS_URL = 'https://localhost:7062/api/Products';
const PRODUCT_GENRES_URL = 'https://localhost:7062/api/ProductGenres';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MANUFACTURERS_URL = 'https://localhost:7062/api/Manufacturers';
const GENRES_URL = 'https://localhost:7062/api/Genres';
const ARTISTS_URL = 'https://localhost:7062/api/Artists';
const ARTIST_MERCH_URL = 'https://localhost:7062/api/ArtistMerches';
const PRODUCTS_FILTER_URL = 'https://localhost:7062/api/Products/filter';
let manufacturers = [];
let allProducts = [];
let genres = [];
let productGenres = {};
let allArtists = [];
let userWishlistIds = [];
let userCartIds = [];
let userCartObjects = [];
let userReviewProductIds = [];
window.currentProductForCart = null;
window.currentProductForReview = null;
window.currentProductForRemove = null;
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '30px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    toast.style.color = 'white';
    toast.style.padding = '11px 22px';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = 'bold';
    toast.style.textAlign = 'center';
    toast.style.minWidth = '225px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(30px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.pointerEvents = 'none';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
async function loadManufacturersForSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const resp = await fetch(MANUFACTURERS_URL);
    if (resp.ok) {
        manufacturers = await resp.json();
        select.innerHTML = '<option value="">Все производители</option>';
        manufacturers.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.manufacturer_id;
            opt.textContent = m.name;
            select.appendChild(opt);
        });
    }
}
function getManufacturerName(id) {
    const m = manufacturers.find(m => m.manufacturer_id === id);
    return m ? m.name : '';
}
async function loadConcertsSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const resp = await fetch(CONCERTS_URL);
    if (resp.ok) {
        const concerts = await resp.json();
        select.innerHTML = '<option value="">Выберите концерт</option>';
        concerts.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.concert_id;
            opt.textContent = `${c.title} (ID ${c.concert_id})`;
            select.appendChild(opt);
        });
    }
}
async function loadGenresAndLinks() {
    try {
        const [genresRes, linksRes] = await Promise.all([
            fetch(GENRES_URL),
            fetch(PRODUCT_GENRES_URL)
        ]);
        if (genresRes.ok) genres = await genresRes.json();
        if (linksRes.ok) {
            const links = await linksRes.json();
            productGenres = {};
            links.forEach(link => {
                if (!productGenres[link.product_id]) productGenres[link.product_id] = [];
                productGenres[link.product_id].push(link.genre_id);
            });
        }
        renderGenreSelect();
    } catch (err) { console.error(err); }
}
function renderGenreSelect() {
    const container = document.getElementById('genre-select');
    if (!container) return;
    container.innerHTML = '<option value="">Все жанры</option>';
    const sortedGenres = [...genres].sort((a, b) => a.name.localeCompare(b.name));
    sortedGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.genre_id;
        option.textContent = genre.name;
        container.appendChild(option);
    });
}
function getSelectedGenres() {
    const select = document.getElementById('genre-select');
    if (!select || !select.value) return [];
    return [parseInt(select.value)];
}
async function loadUserStatus() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return;
    try {
        const [wishlistRes, cartRes, reviewsRes] = await Promise.all([
            fetch(`https://localhost:7062/api/Wishlists/byUser/${userId}`),
            fetch(`https://localhost:7062/api/Carts/byUser/${userId}`),
            fetch(`https://localhost:7062/api/Reviews/byUser/${userId}`)
        ]);
        if (wishlistRes.ok) userWishlistIds = (await wishlistRes.json()).map(i => i.product_id);
        if (cartRes.ok) {
            userCartObjects = await cartRes.json();
            userCartIds = userCartObjects.map(i => i.product_id);
        }
        if (reviewsRes.ok) userReviewProductIds = (await reviewsRes.json()).map(i => i.product_id);
    } catch (err) { console.error(err); }
    if (typeof renderCatalog === 'function') renderCatalog();
}
window.showCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    document.getElementById('cart-product-name').innerText = window.currentProductForCart.name;
    document.getElementById('cart-quantity').value = 1;
    modal.style.display = 'block';
};
window.hideCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
    window.currentProductForCart = null;
};
window.showReviewModal = function () {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    document.getElementById('review-product-name').innerText = window.currentProductForReview.name;
    document.getElementById('review-rating').value = 5;
    document.getElementById('review-text').value = '';
    modal.style.display = 'block';
};
window.hideReviewModal = function () {
    const modal = document.getElementById('review-modal');
    if (modal) modal.style.display = 'none';
    window.currentProductForReview = null;
};
async function loadAllArtists() {
    const resp = await fetch(ARTISTS_URL);
    if (resp.ok) allArtists = await resp.json();
}
async function loadManufacturerNameDatalist() {
    const datalist = document.getElementById('manufacturer-name-datalist');
    if (!datalist) return;
    const resp = await fetch('https://localhost:7062/api/Manufacturers/filter/names');
    if (resp.ok) {
        const names = await resp.json();
        datalist.innerHTML = '';
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    }
}
async function loadManufacturerCountryDatalist() {
    const datalist = document.getElementById('manufacturer-country-datalist');
    if (!datalist) return;
    const resp = await fetch('https://localhost:7062/api/Manufacturers/filter/countries');
    if (resp.ok) {
        const countries = await resp.json();
        datalist.innerHTML = '';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            datalist.appendChild(option);
        });
    }
}
async function loadGenreNameDatalist() {
    const datalist = document.getElementById('genre-name-datalist');
    if (!datalist) return;
    const resp = await fetch('https://localhost:7062/api/Genres/filter/names');
    if (resp.ok) {
        const names = await resp.json();
        datalist.innerHTML = '';
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    }
}
loadManufacturerNameDatalist();
loadManufacturerCountryDatalist();
loadGenreNameDatalist();
loadAllArtists();