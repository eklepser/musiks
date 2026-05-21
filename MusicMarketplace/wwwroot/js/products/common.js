// common.js
const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const CLOTHINGS_URL = 'https://localhost:7062/api/Clothings';
const ACCESSORIES_URL = 'https://localhost:7062/api/Accessories';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MANUFACTURERS_URL = 'https://localhost:7062/api/Manufacturers';
const GENRES_URL = 'https://localhost:7062/api/Genres';
const PRODUCT_GENRES_URL = 'https://localhost:7062/api/ProductGenres';
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

let currentProductForCart = null;
let currentProductForReview = null;
let currentProductForRemove = null;

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
    const resp = await fetch(MANUFACTURERS_URL);
    if (resp.ok) {
        manufacturers = await resp.json();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Все производители</option>';
            manufacturers.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.manufacturer_id;
                opt.textContent = m.name;
                select.appendChild(opt);
            });
        }
    }
}

function getManufacturerName(id) {
    const m = manufacturers.find(m => m.manufacturer_id === id);
    return m ? m.name : '';
}

async function loadConcertsSelect(selectId) {
    const resp = await fetch(CONCERTS_URL);
    if (resp.ok) {
        const concerts = await resp.json();
        const select = document.getElementById(selectId);
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

function validateTicket() {
    const name = document.getElementById('ticket-name').value.trim();
    const price = parseFloat(document.getElementById('ticket-price').value);
    const concertId = document.getElementById('ticket-concert-id').value;
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    if (!concertId) return 'Выберите концерт.';
    return null;
}

function validateClothing() {
    const name = document.getElementById('clothing-name').value.trim();
    const price = parseFloat(document.getElementById('clothing-price').value);
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    const manufacturerId = document.getElementById('clothing-manufacturer-id').value;
    if (!manufacturerId) return 'Выберите производителя.';
    const stock = document.getElementById('clothing-stock').value;
    if (stock && parseInt(stock) < 0) return 'Остаток не может быть отрицательным.';
    return null;
}

function validateAccessory() {
    const name = document.getElementById('accessory-name').value.trim();
    const price = parseFloat(document.getElementById('accessory-price').value);
    if (!name) return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price)) return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    const manufacturerId = document.getElementById('accessory-manufacturer-id').value;
    if (!manufacturerId) return 'Выберите производителя.';
    const weight = document.getElementById('accessory-weight').value;
    if (weight && parseFloat(weight) < 0) return 'Вес не может быть отрицательным.';
    return null;
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

function showCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    document.getElementById('cart-product-name').innerText = currentProductForCart.name;
    document.getElementById('cart-quantity').value = 1;
    modal.style.display = 'block';
}

function hideCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
    currentProductForCart = null;
}

function showReviewModal() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    document.getElementById('review-product-name').innerText = currentProductForReview.name;
    document.getElementById('review-rating').value = 5;
    document.getElementById('review-text').value = '';
    modal.style.display = 'block';
}

function hideReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.style.display = 'none';
    currentProductForReview = null;
}

async function loadAllArtists() {
    const resp = await fetch(ARTISTS_URL);
    if (resp.ok) {
        allArtists = await resp.json();
    }
}

async function loadManufacturerNameDatalist() {
    const resp = await fetch('https://localhost:7062/api/Manufacturers/filter/names');
    if (resp.ok) {
        const names = await resp.json();
        const datalist = document.getElementById('manufacturer-name-datalist');
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

async function loadManufacturerCountryDatalist() {
    const resp = await fetch('https://localhost:7062/api/Manufacturers/filter/countries');
    if (resp.ok) {
        const countries = await resp.json();
        const datalist = document.getElementById('manufacturer-country-datalist');
        if (datalist) {
            datalist.innerHTML = '';
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                datalist.appendChild(option);
            });
        }
    }
}

async function loadGenreNameDatalist() {
    const resp = await fetch('https://localhost:7062/api/Genres/filter/names');
    if (resp.ok) {
        const names = await resp.json();
        const datalist = document.getElementById('genre-name-datalist');
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

loadManufacturerNameDatalist();
loadManufacturerCountryDatalist();
loadGenreNameDatalist();
loadAllArtists();