window.wishlistData = [];
window.cartData = [];
window.reviewsData = [];
window.ordersData = [];

window.getCurrentUser = async function () {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    try {
        const resp = await fetch(`${window.API_URLS.USERS}/${userId}`);
        if (resp.ok) return await resp.json();
    } catch (e) { console.error(e); }
    return null;
};

window.loadUserStatus = async function () {
    const userId = window.getCurrentUserId();
    if (!userId) {
        window.userWishlistIds = [];
        window.userCartIds = [];
        window.userReviewProductIds = [];
        if (typeof window.Catalog?.render === 'function') window.Catalog.render();
        if (document.getElementById('purchased-items-tbody')) window.renderPurchasedItems(window.ordersData || []);
        return;
    }
    try {
        const [wishlistRes, cartRes, reviewsRes] = await Promise.all([
            fetch(`${window.API_URLS.WISHLISTS}/byUser/${userId}`),
            fetch(`${window.API_URLS.CARTS}/byUser/${userId}`),
            fetch(`${window.API_URLS.REVIEWS}/byUser/${userId}`)
        ]);
        if (wishlistRes.ok) window.userWishlistIds = (await wishlistRes.json()).map(i => i.product_id);
        else window.userWishlistIds = [];
        if (cartRes.ok) {
            window.userCartObjects = await cartRes.json();
            window.userCartIds = window.userCartObjects.map(i => i.product_id);
        } else {
            window.userCartIds = [];
        }
        if (reviewsRes.ok) window.userReviewProductIds = (await reviewsRes.json()).map(i => i.product_id);
        else window.userReviewProductIds = [];
    } catch (err) { console.error(err); }
    if (typeof window.Catalog?.render === 'function') window.Catalog.render();
    if (document.getElementById('purchased-items-tbody')) window.renderPurchasedItems(window.ordersData || []);
};

window.loadWishlist = async function () {
    const user = await window.getCurrentUser();
    if (!user) return;
    const searchName = document.getElementById('wishlist-search')?.value.trim() || '';
    const sortBy = document.getElementById('wishlist-sort')?.value || '';
    let url = `${window.API_URLS.WISHLISTS}/byUser/${user.user_id}/filter?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.wishlistData = await resp.json();
            window.renderWishlist();
        }
    } catch (e) { console.error(e); }
};

window.loadCart = async function () {
    const user = await window.getCurrentUser();
    if (!user) return;
    const searchName = document.getElementById('cart-search')?.value.trim() || '';
    const sortBy = document.getElementById('cart-sort')?.value || '';
    let url = `${window.API_URLS.CARTS}/byUser/${user.user_id}/filter?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.cartData = await resp.json();
            window.renderCart();
        }
    } catch (e) { console.error(e); }
};

window.loadReviews = async function () {
    const user = await window.getCurrentUser();
    if (!user) return;
    const search = document.getElementById('reviews-search')?.value.trim() || '';
    const rating = document.getElementById('reviews-rating')?.value || '';
    const sortBy = document.getElementById('reviews-sort')?.value || '';
    let url = `${window.API_URLS.REVIEWS}/byUser/${user.user_id}/filter?`;
    if (search) url += `searchName=${encodeURIComponent(search)}&`;
    if (rating) url += `rating=${rating}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            window.reviewsData = await resp.json();
            window.renderReviews();
        }
    } catch (e) { console.error(e); }
};

window.loadOrders = async function () {
    const user = await window.getCurrentUser();
    if (!user) return;
    const status = document.getElementById('orders-status')?.value || '';
    const dateFrom = document.getElementById('orders-date-from')?.value || '';
    const dateTo = document.getElementById('orders-date-to')?.value || '';
    const sortBy = document.getElementById('orders-sort')?.value || '';
    let url = `${window.API_URLS.ORDERS}/byUser/${user.user_id}/detailed?`;
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
            window.renderOrders();
        } else {
            console.error('Failed to load orders:', resp.status);
            window.ordersData = [];
            window.renderOrders();
        }
    } catch (e) {
        console.error('Error loading orders:', e);
        window.ordersData = [];
        window.renderOrders();
    }
};

window.renderWishlist = function () {
    const tbody = document.getElementById('wishlist-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.wishlistData || window.wishlistData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Список избранного пуст</tbody>';
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
        cartBtn.textContent = '🛒';
        cartBtn.classList.add('cart-btn');
        cartBtn.title = 'В корзину';
        cartBtn.onclick = () => window.addToCart(item.product_id, item.name, 1);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => window.removeFromWishlist(item.product_id);
        btnRow.append(cartBtn, delBtn);
        actions.appendChild(btnRow);
    });
};

window.renderCart = function () {
    const tbody = document.getElementById('cart-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.cartData || window.cartData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Корзина пуста</tbody>';
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
};

window.renderReviews = function () {
    const tbody = document.getElementById('reviews-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.reviewsData || window.reviewsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Отзывов нет</tbody>';
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
};

window.renderOrders = function () {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!window.ordersData || window.ordersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет заказов</tbody>';
        window.renderPurchasedItems([]);
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
            completeBtn.classList.add('complete-btn');
            completeBtn.onclick = () => window.completeOrder(order.order_id);
            bottomRow.appendChild(completeBtn);
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Отменить';
            cancelBtn.classList.add('cancel-btn');
            cancelBtn.onclick = () => window.cancelOrder(order.order_id);
            bottomRow.appendChild(cancelBtn);
        }
        actions.append(topRow, bottomRow);
    });
    window.renderPurchasedItems(window.ordersData || []);
};

window.renderPurchasedItems = function (orders) {
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет товаров в завершённых заказах</tbody>';
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
            reviewBtn.classList.add('review-btn', 'disabled');
        } else {
            reviewBtn.classList.add('review-btn');
            reviewBtn.onclick = () => {
                window.currentProductForReview = { id: item.product_id, name: item.product_name };
                window.showReviewModal();
            };
        }
        btnRow.appendChild(reviewBtn);
        actions.appendChild(btnRow);
    });
};

window.showOrderDetails = async function (orderId) {
    const order = window.ordersData.find(o => o.order_id === orderId);
    if (!order) { window.showToast('Заказ не найден', 'error'); return; }
    const items = order.items || [];
    document.getElementById('modal-order-id').textContent = orderId;
    document.getElementById('modal-order-date').textContent = new Date(order.order_date).toLocaleString();
    document.getElementById('modal-order-status').textContent = order.status === 'pending' ? 'Ожидает' : (order.status === 'completed' ? 'Завершён' : 'Отменён');
    document.getElementById('modal-order-total').textContent = order.total_amount?.toFixed(2);
    document.getElementById('modal-user-name').textContent = `${order.user_name} (${order.user_login})`;
    const tbody = document.getElementById('modal-order-items-tbody');
    tbody.innerHTML = '';
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Нет товаров</tbody>';
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
    const confirmed = await window.showConfirmModal({
        title: 'Завершение заказа',
        message: 'Завершить заказ?',
        yesText: 'Да, завершить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`${window.API_URLS.ORDERS}/${orderId}/complete`, { method: 'PUT' });
        if (resp.ok) {
            window.showToast('Заказ успешно завершён', 'success');
            await window.loadOrders();
        } else {
            const err = await resp.json();
            window.showToast(err.message || 'Ошибка завершения', 'error');
        }
    } catch (e) { window.showToast('Ошибка сети', 'error'); }
};

window.cancelOrder = async function (orderId) {
    const confirmed = await window.showConfirmModal({
        title: 'Отмена заказа',
        message: 'Отменить заказ? Остаток товаров на складе будет восстановлен.',
        yesText: 'Да, отменить',
        noText: 'Нет'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`${window.API_URLS.ORDERS}/${orderId}/cancel`, { method: 'PUT' });
        if (resp.ok) {
            window.showToast('Заказ отменён, товары возвращены на склад', 'success');
            await window.loadOrders();
        } else {
            const err = await resp.json();
            window.showToast(err.message || 'Ошибка отмены', 'error');
        }
    } catch (e) { window.showToast('Ошибка сети', 'error'); }
};

window.showCheckoutModal = function () {
    if (!window.cartData || window.cartData.length === 0) { window.showToast('Корзина пуста', 'error'); return; }
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    const userInfoDiv = document.getElementById('checkout-user-info');
    const itemsTbody = document.getElementById('checkout-items-tbody');
    const totalSpan = document.getElementById('checkout-total');
    window.getCurrentUser().then(user => {
        if (user) {
            userInfoDiv.innerHTML = `<strong>Пользователь:</strong> ${user.full_name} (${user.login})<br><strong>Email:</strong> ${user.email}`;
        } else {
            userInfoDiv.innerHTML = '<strong>Пользователь не выбран</strong>';
        }
    });
    itemsTbody.innerHTML = '';
    let total = 0;
    window.cartData.forEach(item => {
        const row = itemsTbody.insertRow();
        row.insertCell(0).textContent = item.name;
        row.insertCell(1).textContent = item.quantity;
        row.insertCell(2).textContent = item.price.toFixed(2);
        const sum = item.price * item.quantity;
        row.insertCell(3).textContent = sum.toFixed(2);
        total += sum;
    });
    totalSpan.textContent = total.toFixed(2);
    modal.style.display = 'block';
};

window.hideCheckoutModal = function () {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'none';
};

window.confirmCheckout = async function () {
    const user = await window.getCurrentUser();
    if (!user) { window.showToast('Сначала выберите пользователя', 'error'); return; }
    if (!window.cartData || window.cartData.length === 0) { window.showToast('Корзина пуста', 'error'); return; }
    try {
        const resp = await fetch(`${window.API_URLS.CARTS}/checkout/${user.user_id}`, { method: 'POST' });
        if (!resp.ok) {
            let errorMsg = 'Ошибка оформления заказа';
            try {
                const error = await resp.json();
                if (error.message) errorMsg = error.message;
            } catch (e) { errorMsg = await resp.text(); }
            window.showToast(errorMsg, 'error');
            return;
        }
        const result = await resp.json();
        window.hideCheckoutModal();
        window.showToast(`Заказ №${result.orderId} оформлен на сумму ${result.totalAmount}`, 'success');
        await window.loadCart();
        await window.loadOrders();
        document.querySelector('.tab-btn[data-tab="orders"]').click();
    } catch (err) { window.showToast('Ошибка сети', 'error'); }
};

window.checkout = function () {
    window.showCheckoutModal();
};

window.clearAllTables = function () {
    const wishTbody = document.getElementById('wishlist-tbody');
    if (wishTbody) wishTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</tbody>';
    const cartTbody = document.getElementById('cart-tbody');
    if (cartTbody) cartTbody.innerHTML = '<td><td colspan="6" style="text-align: center;">Выберите пользователя</tbody>';
    const revTbody = document.getElementById('reviews-tbody');
    if (revTbody) revTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</tbody>';
    const ordTbody = document.getElementById('orders-tbody');
    if (ordTbody) ordTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Выберите пользователя</tbody>';
    const purTbody = document.getElementById('purchased-items-tbody');
    if (purTbody) purTbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Выберите пользователя</tbody>';
};

window.showActiveTab = function () {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    const tabId = activeTab.dataset.tab;
    if (tabId === 'wishlist') window.renderWishlist();
    else if (tabId === 'cart') window.renderCart();
    else if (tabId === 'orders') window.renderOrders();
    else if (tabId === 'reviews') window.renderReviews();
};

window.loadDashboard = async function () {
    const user = await window.getCurrentUser();
    if (!user) {
        window.clearAllTables();
        const profileTitle = document.querySelector('#user-profile h2') || document.querySelector('.profile-header h2') || document.getElementById('profile-title');
        if (profileTitle) profileTitle.textContent = 'Мой профиль';
        return;
    }
    const profileTitle = document.querySelector('#user-profile h2') || document.querySelector('.profile-header h2') || document.getElementById('profile-title');
    if (profileTitle) profileTitle.textContent = `${user.full_name} (${user.login})`;
    await window.loadUserStatus();
    await Promise.all([window.loadWishlist(), window.loadCart(), window.loadReviews(), window.loadOrders()]);
    window.showActiveTab();
};

window.showCartModal = function () {
    if (!window.currentProductForCart) return;
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    document.getElementById('cart-product-name').innerText = window.currentProductForCart.name;
    const quantityInput = document.getElementById('cart-quantity');
    if (quantityInput) {
        quantityInput.value = 1;
        quantityInput.setAttribute('data-integer', 'true');
        quantityInput.inputMode = 'numeric';
    }
    modal.style.display = 'block';
};

window.hideCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
    window.currentProductForCart = null;
};

window.showRemoveFromCartModal = function (productId, productName, currentQuantity) {
    if (currentQuantity <= 1) { window.removeFromCart(productId); return; }
    window.currentProductForRemove = { id: productId, name: productName, currentQuantity: currentQuantity };
    const modal = document.getElementById('remove-from-cart-modal');
    if (!modal) return;
    document.getElementById('remove-cart-product-name').innerText = productName;
    const quantityInput = document.getElementById('remove-cart-quantity');
    if (quantityInput) {
        quantityInput.value = 1;
        quantityInput.setAttribute('data-integer', 'true');
        quantityInput.inputMode = 'numeric';
    }
    document.getElementById('remove-cart-max').innerText = currentQuantity;
    modal.style.display = 'block';
};

window.hideRemoveFromCartModal = function () {
    const modal = document.getElementById('remove-from-cart-modal');
    if (modal) modal.style.display = 'none';
    window.currentProductForRemove = null;
};

window.removeFromCartWithQuantity = async function (productId, quantity) {
    const userId = window.getCurrentUserId();
    if (!userId) return;
    try {
        const resp = await fetch(`${window.API_URLS.CARTS}/${userId}/${productId}?quantity=${quantity}`, { method: 'DELETE' });
        if (resp.ok) {
            if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
            if (typeof window.loadCart === 'function') await window.loadCart();
            window.showToast(`Товар удалён из корзины (${quantity} шт.)`, 'success');
            window.hideRemoveFromCartModal();
        } else {
            const error = await resp.json();
            window.showToast(error.message || 'Ошибка удаления', 'error');
        }
    } catch (err) { window.showToast('Ошибка сети', 'error'); }
};

window.removeFromCart = async function (productId) {
    const userId = window.getCurrentUserId();
    if (!userId) return;
    const confirmed = await window.showConfirmModal({
        title: 'Удаление из корзины',
        message: `Удалить товар из корзины?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`${window.API_URLS.CARTS}/${userId}/${productId}`, { method: 'DELETE' });
        if (resp.ok) {
            if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
            if (typeof window.loadCart === 'function') await window.loadCart();
            window.showToast('Товар удалён из корзины', 'success');
        } else {
            const error = await resp.json();
            window.showToast(error.message || 'Ошибка удаления', 'error');
        }
    } catch (err) { window.showToast('Ошибка сети', 'error'); }
};

window.addReview = async function (productId, productName, rating, reviewText) {
    const userId = window.getCurrentUserId();
    if (!userId) { window.showToast('Сначала выберите пользователя', 'error'); return false; }
    if (!rating || rating < 1 || rating > 5) { window.showToast('Оценка должна быть от 1 до 5', 'error'); return false; }
    try {
        const resp = await fetch(window.API_URLS.REVIEWS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, rating: rating, review_text: reviewText })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            window.showToast(error.message || 'Вы уже оставляли отзыв на этот товар', 'warning');
            if (!window.userReviewProductIds) window.userReviewProductIds = [];
            if (!window.userReviewProductIds.includes(productId)) window.userReviewProductIds.push(productId);
            if (typeof window.renderPurchasedItems === 'function') window.renderPurchasedItems(window.ordersData || []);
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        window.showToast(`Отзыв на товар «${productName}» добавлен`, 'success');
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadOrders === 'function') await window.loadOrders();
        if (typeof window.loadReviews === 'function') await window.loadReviews();
        if (typeof window.renderPurchasedItems === 'function') window.renderPurchasedItems(window.ordersData || []);
        return true;
    } catch (err) { window.showToast('Ошибка добавления отзыва', 'error'); return false; }
};

window.deleteReview = async function (productId) {
    const userId = window.getCurrentUserId();
    if (!userId) return;
    const confirmed = await window.showConfirmModal({
        title: 'Удаление отзыва',
        message: `Удалить отзыв на этот товар?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    const resp = await fetch(`${window.API_URLS.REVIEWS}/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (window.userReviewProductIds) {
            const index = window.userReviewProductIds.indexOf(productId);
            if (index !== -1) window.userReviewProductIds.splice(index, 1);
        }
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadOrders === 'function') await window.loadOrders();
        if (typeof window.loadReviews === 'function') await window.loadReviews();
        if (typeof window.renderPurchasedItems === 'function') window.renderPurchasedItems(window.ordersData || []);
        window.showToast('Отзыв удалён', 'success');
    } else window.showToast('Ошибка удаления', 'error');
};

window.showReviewModal = function () {
    if (!window.currentProductForReview) return;
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