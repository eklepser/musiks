window.getCurrentUserId = function () {
    const savedId = localStorage.getItem('currentUserId');
    return savedId ? parseInt(savedId) : null;
};

window.addToWishlist = async function (productId, productName) {
    const userId = window.getCurrentUserId();
    if (!userId) { window.showToast('Сначала выберите пользователя', 'error'); return false; }
    try {
        const resp = await fetch(window.API_URLS.WISHLISTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            window.showToast(error.message || 'Товар уже в избранном', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        window.showToast(`Товар «${productName}» добавлен в избранное`, 'success');
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadWishlist === 'function') await window.loadWishlist();
        return true;
    } catch (err) { window.showToast('Ошибка добавления в избранное', 'error'); return false; }
};

window.removeFromWishlist = async function (productId) {
    const userId = window.getCurrentUserId();
    if (!userId) return;
    const confirmed = await window.showConfirmModal({
        title: 'Удаление из избранного',
        message: `Удалить товар из избранного?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    const resp = await fetch(`${window.API_URLS.WISHLISTS}/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadWishlist === 'function') await window.loadWishlist();
        window.showToast('Товар удалён из избранного', 'success');
    } else window.showToast('Ошибка удаления', 'error');
};

window.addToCart = async function (productId, productName, quantity = 1) {
    const userId = window.getCurrentUserId();
    if (!userId) { window.showToast('Сначала выберите пользователя', 'error'); return false; }
    try {
        const resp = await fetch(window.API_URLS.CARTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, quantity: quantity })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            window.showToast(error.message || 'Товар уже в корзине', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let newQuantity = quantity;
        try {
            const result = await resp.json();
            if (result && result.quantity) newQuantity = result.quantity;
        } catch (e) { }
        window.showToast(`Товар «${productName}» добавлен в корзину${newQuantity > 1 ? ` (теперь ${newQuantity} шт.)` : ''}`, 'success');
        if (typeof window.loadCart === 'function') await window.loadCart();
        return true;
    } catch (err) { window.showToast('Ошибка добавления в корзину', 'error'); return false; }
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
        quantityInput.max = currentQuantity;
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
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        window.showToast(`Отзыв на товар «${productName}» добавлен`, 'success');
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadOrders === 'function') await window.loadOrders();
        if (typeof window.loadReviews === 'function') await window.loadReviews();
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
        if (typeof window.loadUserStatus === 'function') await window.loadUserStatus();
        if (typeof window.loadOrders === 'function') await window.loadOrders();
        if (typeof window.loadReviews === 'function') await window.loadReviews();
        window.showToast('Отзыв удалён', 'success');
    } else window.showToast('Ошибка удаления', 'error');
};