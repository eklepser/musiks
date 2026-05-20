async function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    const resp = await fetch(`https://localhost:7062/api/Users/${userId}`);
    if (resp.ok) return await resp.json();
    return null;
}

async function loadWishlist() {
    const user = await getCurrentUser();
    if (!user) return;
    const resp = await fetch(`https://localhost:7062/api/Wishlists/byUser/${user.user_id}`);
    if (resp.ok) {
        window.wishlistData = await resp.json();
        renderWishlist();
    }
}

async function loadCart() {
    const user = await getCurrentUser();
    if (!user) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/byUser/${user.user_id}`);
    if (resp.ok) {
        window.cartData = await resp.json();
        renderCart();
    }
}

async function loadReviews() {
    const user = await getCurrentUser();
    if (!user) return;
    const resp = await fetch(`https://localhost:7062/api/Reviews/byUser/${user.user_id}`);
    if (resp.ok) {
        window.reviewsData = await resp.json();
        renderReviews();
    }
}

async function loadOrders() {
    const user = await getCurrentUser();
    if (!user) return;
    const resp = await fetch(`https://localhost:7062/api/Orders/byUser/${user.user_id}`);
    if (resp.ok) {
        window.ordersData = await resp.json();
        renderOrders();
    }
}

function renderWishlist() {
    const search = document.getElementById('wishlist-search').value.trim().toLowerCase();
    let filtered = (window.wishlistData || []).filter(item => !search || item.name.toLowerCase().includes(search));
    const tbody = document.getElementById('wishlist-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Вишлист пуст</td></tr>';
        return;
    }
    filtered.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.price;
        row.insertCell(3).textContent = new Date(item.added_date).toLocaleDateString();
        const actions = row.insertCell(4);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => removeFromWishlist(item.product_id);
        actions.appendChild(delBtn);
    });
}

function renderCart() {
    const search = document.getElementById('cart-search').value.trim().toLowerCase();
    let filtered = (window.cartData || []).filter(item => !search || item.name.toLowerCase().includes(search));
    const tbody = document.getElementById('cart-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Корзина пуста</td></tr>';
        return;
    }
    filtered.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.price;
        row.insertCell(3).textContent = item.quantity;
        row.insertCell(4).textContent = new Date(item.added_date).toLocaleDateString();
        const actions = row.insertCell(5);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => removeFromCart(item.product_id);
        actions.appendChild(delBtn);
    });
}

function renderReviews() {
    const search = document.getElementById('reviews-search').value.trim().toLowerCase();
    const rating = document.getElementById('reviews-rating').value;
    let filtered = (window.reviewsData || []).filter(r => {
        if (search && !r.product_name.toLowerCase().includes(search)) return false;
        if (rating && r.rating != rating) return false;
        return true;
    });
    const tbody = document.getElementById('reviews-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Отзывов нет</td></tr>';
        return;
    }
    filtered.forEach(r => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = r.product_name;
        row.insertCell(1).textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        row.insertCell(2).textContent = r.review_text || '';
        row.insertCell(3).textContent = new Date(r.review_date).toLocaleDateString();
        const actions = row.insertCell(4);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteReviewFromDashboard(r.product_id);
        actions.appendChild(delBtn);
    });
}

function renderOrders() {
    const status = document.getElementById('orders-status').value;
    const dateFrom = document.getElementById('orders-date-from').value;
    const dateTo = document.getElementById('orders-date-to').value;
    let filtered = (window.ordersData || []).filter(o => {
        if (status && o.status !== status) return false;
        if (dateFrom && new Date(o.order_date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(o.order_date) > new Date(dateTo)) return false;
        return true;
    });
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Заказов нет</td></tr>';
        return;
    }
    filtered.forEach(o => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = o.order_id;
        row.insertCell(1).textContent = new Date(o.order_date).toLocaleString();
        row.insertCell(2).textContent = o.status === 'pending' ? 'Ожидает' : (o.status === 'completed' ? 'Завершён' : 'Отменён');
        row.insertCell(3).textContent = o.total_amount;
        const actions = row.insertCell(4);
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Детали';
        detailsBtn.onclick = () => showOrderDetails(o.order_id);
        actions.appendChild(detailsBtn);
    });
}

async function removeFromWishlist(productId) {
    const user = await getCurrentUser();
    if (!user) return;
    if (!confirm('Удалить из вишлиста?')) return;
    const resp = await fetch(`https://localhost:7062/api/Wishlists/${user.user_id}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadWishlist();
        if (typeof showToast === 'function') showToast('Товар удалён из вишлиста', 'success');
    } else if (typeof showToast === 'function') showToast('Ошибка удаления', 'error');
}

async function removeFromCart(productId) {
    const user = await getCurrentUser();
    if (!user) return;
    if (!confirm('Удалить из корзины?')) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/${user.user_id}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadCart();
        if (typeof showToast === 'function') showToast('Товар удалён из корзины', 'success');
    } else if (typeof showToast === 'function') showToast('Ошибка удаления', 'error');
}

async function deleteReviewFromDashboard(productId) {
    const user = await getCurrentUser();
    if (!user) return;
    if (!confirm('Удалить отзыв?')) return;
    const resp = await fetch(`https://localhost:7062/api/Reviews/${user.user_id}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadReviews();
        if (typeof showToast === 'function') showToast('Отзыв удалён', 'success');
        if (typeof loadUserStatus === 'function') await loadUserStatus();
    } else if (typeof showToast === 'function') showToast('Ошибка удаления', 'error');
}

function showOrderDetails(orderId) {
    alert(`Детали заказа ${orderId} будут реализованы позже`);
}

function clearAllTables() {
    document.getElementById('wishlist-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
    document.getElementById('cart-tbody').innerHTML = '<tr><td colspan="6" style="text-align: center;">Выберите пользователя</td></tr>';
    document.getElementById('reviews-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
    document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
}

function showActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === 'wishlist') renderWishlist();
    else if (activeTab === 'cart') renderCart();
    else if (activeTab === 'reviews') renderReviews();
    else if (activeTab === 'orders') renderOrders();
}

async function loadDashboard() {
    const user = await getCurrentUser();
    if (!user) {
        document.getElementById('user-info').innerHTML = 'Выберите пользователя';
        clearAllTables();
        return;
    }
    document.getElementById('user-info').innerHTML = `Пользователь: ${user.full_name} (${user.login})`;
    await Promise.all([loadWishlist(), loadCart(), loadReviews(), loadOrders()]);
    showActiveTab();
}

async function checkout() {
    const user = await getCurrentUser();
    if (!user) {
        showToast('Сначала выберите пользователя', 'error');
        return;
    }
    if (!window.cartData || window.cartData.length === 0) {
        showToast('Корзина пуста', 'error');
        return;
    }
    if (!confirm('Оформить заказ?')) return;

    try {
        const resp = await fetch(`https://localhost:7062/api/Carts/checkout/${user.user_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!resp.ok) {
            const error = await resp.text();
            showToast(error || 'Ошибка оформления заказа', 'error');
            return;
        }
        const result = await resp.json();
        showToast(`Заказ №${result.orderId} оформлен на сумму ${result.totalAmount}`, 'success');
        // Обновляем корзину и заказы
        await loadCart();
        await loadOrders();
        // Переключаемся на вкладку заказов (опционально)
        document.querySelector('.tab-btn[data-tab="orders"]').click();
    } catch (err) {
        showToast('Ошибка сети', 'error');
    }
}

document.getElementById('wishlist-filter').addEventListener('click', renderWishlist);
document.getElementById('wishlist-reset').addEventListener('click', () => { document.getElementById('wishlist-search').value = ''; renderWishlist(); });
document.getElementById('cart-filter').addEventListener('click', renderCart);
document.getElementById('cart-reset').addEventListener('click', () => { document.getElementById('cart-search').value = ''; renderCart(); });
document.getElementById('reviews-filter').addEventListener('click', renderReviews);
document.getElementById('reviews-reset').addEventListener('click', () => { document.getElementById('reviews-search').value = ''; document.getElementById('reviews-rating').value = ''; renderReviews(); });
document.getElementById('orders-filter').addEventListener('click', renderOrders);
document.getElementById('orders-reset').addEventListener('click', () => { document.getElementById('orders-status').value = ''; document.getElementById('orders-date-from').value = ''; document.getElementById('orders-date-to').value = ''; renderOrders(); });

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        showActiveTab();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
});

loadDashboard();