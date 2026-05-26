window.wishlistData =[];
window.cartData = [];
window.reviewsData = [];
window.ordersData = [];

async function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    try {
        const resp = await fetch(`https://localhost:7062/api/Users/${userId}`);
        if (resp.ok) return await resp.json();
    } catch (e) { console.error(e); }
    return null;
}

async function loadWishlist() {
    const user = await getCurrentUser();
    if (!user) return;
    const searchName = document.getElementById('wishlist-search').value.trim();
    const sortBy = document.getElementById('wishlist-sort').value;
    let url = `https://localhost:7062/api/Wishlists/byUser/${user.user_id}/filter?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.wishlistData = await resp.json();
            renderWishlist();
        }
    } catch (e) { console.error(e); }
}

async function loadCart() {
    const user = await getCurrentUser();
    if (!user) return;
    const searchName = document.getElementById('cart-search').value.trim();
    const sortBy = document.getElementById('cart-sort').value;
    let url = `https://localhost:7062/api/Carts/byUser/${user.user_id}/filter?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.cartData = await resp.json();
            renderCart();
        }
    } catch (e) { console.error(e); }
}

async function loadReviews() {
    const user = await getCurrentUser();
    if (!user) return;
    const search = document.getElementById('reviews-search').value.trim();
    const rating = document.getElementById('reviews-rating').value;
    const sortBy = document.getElementById('reviews-sort').value;
    let url = `https://localhost:7062/api/Reviews/byUser/${user.user_id}/filter?`;
    if (search) url += `searchName=${encodeURIComponent(search)}&`;
    if (rating) url += `rating=${rating}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.reviewsData = await resp.json();
            renderReviews();
        }
    } catch (e) { console.error(e); }
}

async function loadOrders() {
    const user = await getCurrentUser();
    if (!user) return;
    const status = document.getElementById('orders-status').value;
    const dateFrom = document.getElementById('orders-date-from').value;
    const dateTo = document.getElementById('orders-date-to').value;
    const sortBy = document.getElementById('orders-sort').value;
    let url = `https://localhost:7062/api/Orders/byUser/${user.user_id}/detailed?`;
    if (status) url += `status=${status}&`;
    if (dateFrom) url += `dateFrom=${encodeURIComponent(dateFrom)}&`;
    if (dateTo) url += `dateTo=${encodeURIComponent(dateTo)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            let orders = await resp.json();
            window.ordersData = orders.map(order => {
                let items = [];
                if (order.items_json) {
                    try { items = JSON.parse(order.items_json); } catch (e) { console.error(e); }
                }
                return { ...order, items };
            });
            renderOrders();
        }
    } catch (e) { console.error(e); }
}

function renderWishlist() {
    const tbody = document.getElementById('wishlist-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.wishlistData || window.wishlistData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Вишлист пуст</td></tr>';
        return;
    }
    window.wishlistData.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.price;
        row.insertCell(3).textContent = new Date(item.added_date).toLocaleString();
        const actions = row.insertCell(4);
        const btnRow = document.createElement('div');
        btnRow.className = 'action-buttons-row';
        const cartBtn = document.createElement('button');
        cartBtn.textContent = '🛒 В корзину';
        cartBtn.style.background = '#28a745';
        cartBtn.onclick = () => window.addToCart(item.product_id, item.name, 1);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => window.removeFromWishlist(item.product_id);
        btnRow.append(cartBtn, delBtn);
        actions.appendChild(btnRow);
    });
}

function renderCart() {
    const tbody = document.getElementById('cart-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.cartData || window.cartData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Корзина пуста</td></tr>';
        return;
    }
    window.cartData.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.price;
        row.insertCell(3).textContent = item.quantity;
        row.insertCell(4).textContent = new Date(item.added_date).toLocaleString();
        const actions = row.insertCell(5);
        const btnRow = document.createElement('div');
        btnRow.className = 'action-buttons-row';
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => window.showRemoveFromCartModal(item.product_id, item.name, item.quantity);
        btnRow.appendChild(delBtn);
        actions.appendChild(btnRow);
    });
}

function renderReviews() {
    const tbody = document.getElementById('reviews-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.reviewsData || window.reviewsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Отзывов нет</td></tr>';
        return;
    }
    window.reviewsData.forEach(r => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = r.product_name;
        row.insertCell(1).textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        row.insertCell(2).textContent = r.review_text || '';
        row.insertCell(3).textContent = new Date(r.review_date).toLocaleString();
        const actions = row.insertCell(4);
        const btnRow = document.createElement('div');
        btnRow.className = 'action-buttons-row';
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => window.deleteReview(r.product_id);
        btnRow.appendChild(delBtn);
        actions.appendChild(btnRow);
    });
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.ordersData || window.ordersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет заказов</td></tr>';
        return;
    }
    window.ordersData.forEach(order => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = order.order_id;
        row.insertCell(1).textContent = new Date(order.order_date).toLocaleString();

        const statusCell = row.insertCell(2);
        statusCell.textContent = order.status === 'pending' ? 'Ожидает' : (order.status === 'completed' ? 'Завершён' : 'Отменён');
        if (order.status === 'pending') statusCell.style.fontWeight = 'bold';

        row.insertCell(3).textContent = order.total_amount?.toFixed(2);
        const actions = row.insertCell(4);

        const topRow = document.createElement('div');
        topRow.className = 'action-buttons-row';
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Детали';
        detailsBtn.onclick = () => window.showOrderDetails(order.order_id);
        topRow.appendChild(detailsBtn);

        const bottomRow = document.createElement('div');
        bottomRow.className = 'action-buttons-row';
        if (order.status === 'pending') {
            const completeBtn = document.createElement('button');
            completeBtn.textContent = 'Завершить';
            completeBtn.style.background = '#28a745';
            completeBtn.onclick = () => window.completeOrder(order.order_id);
            bottomRow.appendChild(completeBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Отменить';
            cancelBtn.style.background = '#dc3545';
            cancelBtn.style.marginLeft = '5px';
            cancelBtn.onclick = () => window.cancelOrder(order.order_id);
            bottomRow.appendChild(cancelBtn);
        }
        actions.append(topRow, bottomRow);
    });
    renderPurchasedItems(window.ordersData || []);
}

function renderPurchasedItems(orders) {
    const completedOrders = (orders || []).filter(o => o.status === 'completed');
    const items = [];
    completedOrders.forEach(order => {
        if (order.items && order.items.length) {
            order.items.forEach(item => {
                items.push({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    order_id: order.order_id
                });
            });
        }
    });
    const tbody = document.getElementById('purchased-items-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет товаров в завершённых заказах</td></tr>';
        return;
    }
    items.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.product_id;
        row.insertCell(1).textContent = item.product_name;
        row.insertCell(2).textContent = item.quantity;
        row.insertCell(3).textContent = item.unit_price.toFixed(2);
        row.insertCell(4).textContent = item.total_price.toFixed(2);
        row.insertCell(5).textContent = item.order_id;
        const actions = row.insertCell(6);
        const btnRow = document.createElement('div');
        btnRow.className = 'action-buttons-row';
        const hasReview = window.userReviewProductIds && window.userReviewProductIds.includes(item.product_id);
        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = hasReview ? 'Отзыв оставлен' : 'Оставить отзыв';
        if (hasReview) {
            reviewBtn.disabled = true;
            reviewBtn.style.background = '#6c757d';
        } else {
            reviewBtn.style.background = '#17a2b8';
            reviewBtn.onclick = () => {
                window.currentProductForReview = { id: item.product_id, name: item.product_name };
                window.showReviewModal();
            };
        }
        btnRow.appendChild(reviewBtn);
        actions.appendChild(btnRow);
    });
}

window.showOrderDetails = async function (orderId) {
    const order = window.ordersData.find(o => o.order_id === orderId);
    if (!order) {
        window.showToast('Заказ не найден', 'error');
        return;
    }
    const items = order.items || [];
    document.getElementById('modal-order-id').textContent = orderId;
    document.getElementById('modal-order-date').textContent = new Date(order.order_date).toLocaleString();
    document.getElementById('modal-order-status').textContent = order.status === 'pending' ? 'Ожидает' : (order.status === 'completed' ? 'Завершён' : 'Отменён');
    document.getElementById('modal-order-total').textContent = order.total_amount?.toFixed(2);
    document.getElementById('modal-user-name').textContent = `${order.user_name} (${order.user_login})`;
    const tbody = document.getElementById('modal-order-items-tbody');
    tbody.innerHTML = '';
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Нет товаров</td></tr>';
    } else {
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.product_name;
            row.insertCell(1).textContent = item.quantity;
            row.insertCell(2).textContent = item.unit_price.toFixed(2);
            row.insertCell(3).textContent = item.total_price.toFixed(2);
        });
    }
    document.getElementById('order-details-modal').style.display = 'block';
};

window.closeOrderModal = function () {
    document.getElementById('order-details-modal').style.display = 'none';
};

window.completeOrder = async function (orderId) {
    if (!confirm('Завершить заказ?')) return;
    try {
        const resp = await fetch(`https://localhost:7062/api/Orders/${orderId}/complete`, { method: 'PUT' });
        if (resp.ok) {
            window.showToast('Заказ успешно завершён', 'success');
            await loadOrders();
        } else {
            const err = await resp.json();
            window.showToast(err.message || 'Ошибка завершения', 'error');
        }
    } catch (e) { window.showToast('Ошибка сети', 'error'); }
};

window.cancelOrder = async function (orderId) {
    if (!confirm('Отменить заказ? Остаток товаров на складе будет восстановлен.')) return;
    try {
        const resp = await fetch(`https://localhost:7062/api/Orders/${orderId}/cancel`, { method: 'PUT' });
        if (resp.ok) {
            window.showToast('Заказ отменён, товары возвращены на склад', 'success');
            await loadOrders();
        } else {
            const err = await resp.json();
            window.showToast(err.message || 'Ошибка отмены', 'error');
        }
    } catch (e) { window.showToast('Ошибка сети', 'error'); }
};

function clearAllTables() {
    const wishTbody = document.getElementById('wishlist-tbody');
    if (wishTbody) wishTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
    const cartTbody = document.getElementById('cart-tbody');
    if (cartTbody) cartTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Выберите пользователя</td></tr>';
    const revTbody = document.getElementById('reviews-tbody');
    if (revTbody) revTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
    const ordTbody = document.getElementById('orders-tbody');
    if (ordTbody) ordTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</td></tr>';
    const purTbody = document.getElementById('purchased-items-tbody');
    if (purTbody) purTbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Выберите пользователя</td></tr>';
}

function showActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    const tabId = activeTab.dataset.tab;
    if (tabId === 'wishlist') renderWishlist();
    else if (tabId === 'cart') renderCart();
    else if (tabId === 'orders') renderOrders();
    else if (tabId === 'reviews') renderReviews();
}

async function loadDashboard() {
    const user = await getCurrentUser();
    if (!user) {
        clearAllTables();
        const profileTitle = document.querySelector('#user-profile h2') || document.querySelector('.profile-header h2') || document.getElementById('profile-title');
        if (profileTitle) profileTitle.textContent = 'Мой профиль';
        return;
    }
    const profileTitle = document.querySelector('#user-profile h2') || document.querySelector('.profile-header h2') || document.getElementById('profile-title');
    if (profileTitle) profileTitle.textContent = `${user.full_name} (${user.login})`;
    if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
    await Promise.all([loadWishlist(), loadCart(), loadReviews(), loadOrders()]);
    showActiveTab();
}

document.getElementById('wishlist-apply')?.addEventListener('click', loadWishlist);
document.getElementById('wishlist-reset')?.addEventListener('click', () => {
    document.getElementById('wishlist-search').value = '';
    document.getElementById('wishlist-sort').value = 'date_desc';
    loadWishlist();
});
document.getElementById('cart-apply')?.addEventListener('click', loadCart);
document.getElementById('cart-reset')?.addEventListener('click', () => {
    document.getElementById('cart-search').value = '';
    document.getElementById('cart-sort').value = 'date_desc';
    loadCart();
});
document.getElementById('reviews-filter')?.addEventListener('click', loadReviews);
document.getElementById('reviews-reset')?.addEventListener('click', () => {
    document.getElementById('reviews-search').value = '';
    document.getElementById('reviews-rating').value = '';
    document.getElementById('reviews-sort').value = 'date_desc';
    loadReviews();
});
document.getElementById('orders-apply')?.addEventListener('click', loadOrders);
document.getElementById('orders-reset')?.addEventListener('click', () => {
    document.getElementById('orders-status').value = '';
    document.getElementById('orders-date-from').value = '';
    document.getElementById('orders-date-to').value = '';
    document.getElementById('orders-sort').value = 'date_desc';
    loadOrders();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabContent = document.getElementById(`${btn.dataset.tab}-tab`);
        if (tabContent) tabContent.classList.add('active');
        showActiveTab();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', window.checkout);
    const closeModal = document.getElementById('modal-order-close');
    if (closeModal) closeModal.addEventListener('click', window.closeOrderModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('order-details-modal');
        if (e.target === modal) modal.style.display = 'none';
    });

    const cartConfirmBtn = document.getElementById('cart-confirm-btn');
    if (cartConfirmBtn) {
        cartConfirmBtn.addEventListener('click', () => {
            if (window.currentProductForCart) {
                const quantity = parseInt(document.getElementById('cart-quantity').value);
                window.addToCart(window.currentProductForCart.id, window.currentProductForCart.name, quantity);
                window.hideCartModal();
            }
        });
    }
    const cartCancelBtn = document.getElementById('cart-cancel-btn');
    if (cartCancelBtn) cartCancelBtn.addEventListener('click', window.hideCartModal);

    const reviewConfirmBtn = document.getElementById('review-confirm-btn');
    if (reviewConfirmBtn) {
        reviewConfirmBtn.addEventListener('click', () => {
            if (window.currentProductForReview) {
                const rating = parseInt(document.getElementById('review-rating').value);
                const reviewText = document.getElementById('review-text').value;
                window.addReview(window.currentProductForReview.id, window.currentProductForReview.name, rating, reviewText);
                window.hideReviewModal();
                loadReviews();
            }
        });
    }
    const reviewCancelBtn = document.getElementById('review-cancel-btn');
    if (reviewCancelBtn) reviewCancelBtn.addEventListener('click', window.hideReviewModal);

    const removeCartConfirm = document.getElementById('remove-cart-confirm-btn');
    if (removeCartConfirm) {
        removeCartConfirm.addEventListener('click', () => {
            if (window.currentProductForRemove) {
                const quantity = parseInt(document.getElementById('remove-cart-quantity').value);
                if (quantity && quantity > 0 && quantity <= window.currentProductForRemove.currentQuantity) {
                    window.removeFromCartWithQuantity(window.currentProductForRemove.id, quantity);
                } else {
                    window.showToast('Некорректное количество', 'error');
                }
            }
        });
    }
    const removeCartCancel = document.getElementById('remove-cart-cancel-btn');
    if (removeCartCancel) removeCartCancel.addEventListener('click', window.hideRemoveFromCartModal);
});

loadDashboard();