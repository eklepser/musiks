const PRODUCTS_URL = 'https://localhost:7062/api/Products';
const TICKETS_URL = 'https://localhost:7062/api/Tickets';
const CLOTHINGS_URL = 'https://localhost:7062/api/Clothings';
const ACCESSORIES_URL = 'https://localhost:7062/api/Accessories';
const CONCERTS_URL = 'https://localhost:7062/api/Concerts';
const MANUFACTURERS_URL = 'https://localhost:7062/api/Manufacturers';
const GENRES_URL = 'https://localhost:7062/api/Genres';
const PRODUCT_GENRES_URL = 'https://localhost:7062/api/ProductGenres';

let manufacturers = [];
let allProducts = [];
let genres = [];
let productGenres = {};

let ticketEditId = null;
let clothingEditId = null;
let accessoryEditId = null;
let manufacturerEditId = null;
let genreEditId = null;

async function loadManufacturersForSelect(selectId) {
    const resp = await fetch(MANUFACTURERS_URL);
    if (resp.ok) {
        manufacturers = await resp.json();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Выберите производителя</option>';
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
        renderGenreCheckboxes();
    } catch (err) { console.error(err); }
}

function renderGenreCheckboxes() {
    const container = document.getElementById('genres-filter-container');
    if (!container) return;
    container.innerHTML = '<strong>Жанры:</strong>';
    genres.forEach(genre => {
        const label = document.createElement('label');
        label.style.marginRight = '15px';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = genre.genre_id;
        cb.className = 'genre-checkbox';
        const span = document.createElement('span');
        span.textContent = genre.name;
        label.appendChild(cb);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function getSelectedGenres() {
    const checkboxes = document.querySelectorAll('.genre-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}