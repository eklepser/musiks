function getCurrentUserId() {
    const savedId = localStorage.getItem('currentUserId');
    return savedId ? parseInt(savedId) : null;
}

window.addToWishlist = async function (productId, productName) {
    const userId = getCurrentUserId();
    if (!userId) {
        showToast('Сначала выберите пользователя', 'error');
        return false;
    }
    try {
        const resp = await fetch('https://localhost:7062/api/Wishlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            showToast(error.message || 'Товар уже в вишлисте', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        showToast(`Товар «${productName}» добавлен в вишлист`, 'success');
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        return true;
    } catch (err) {
        showToast('Ошибка добавления в вишлист', 'error');
        return false;
    }
};

window.removeFromWishlist = async function (productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить из вишлиста?')) return;
    const resp = await fetch(`https://localhost:7062/api/Wishlists/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        showToast('Товар удалён из вишлиста', 'success');
    } else showToast('Ошибка удаления', 'error');
};

window.addToCart = async function (productId, productName, quantity = 1) {
    const userId = getCurrentUserId();
    if (!userId) {
        showToast('Сначала выберите пользователя', 'error');
        return false;
    }
    try {
        const resp = await fetch('https://localhost:7062/api/Carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, quantity: quantity })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            showToast(error.message || 'Товар уже в корзине', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let newQuantity = quantity;
        try {
            const result = await resp.json();
            if (result && result.quantity) newQuantity = result.quantity;
        } catch (e) { }
        if (newQuantity > 1) {
            showToast(`Товар «${productName}» добавлен в корзину (теперь ${newQuantity} шт.)`, 'success');
        } else {
            showToast(`Товар «${productName}» добавлен в корзину`, 'success');
        }
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        if (typeof loadCart === 'function') await loadCart();
        return true;
    } catch (err) {
        showToast('Ошибка добавления в корзину', 'error');
        return false;
    }
};

window.showRemoveFromCartModal = function (productId, productName, currentQuantity) {
    if (currentQuantity <= 1) {
        removeFromCart(productId);
        return;
    }
    currentProductForRemove = { id: productId, name: productName, currentQuantity: currentQuantity };
    const modal = document.getElementById('remove-from-cart-modal');
    if (!modal) return;
    document.getElementById('remove-cart-product-name').innerText = productName;
    document.getElementById('remove-cart-quantity').value = 1;
    document.getElementById('remove-cart-quantity').max = currentQuantity;
    document.getElementById('remove-cart-max').innerText = currentQuantity;
    modal.style.display = 'block';
};

window.hideRemoveFromCartModal = function () {
    const modal = document.getElementById('remove-from-cart-modal');
    if (modal) modal.style.display = 'none';
    currentProductForRemove = null;
};

window.removeFromCartWithQuantity = async function (productId, quantity) {
    const userId = getCurrentUserId();
    if (!userId) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/${userId}/${productId}?quantity=${quantity}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        if (typeof loadCart === 'function') await loadCart();
        showToast(`Товар удалён из корзины (${quantity} шт.)`, 'success');
        hideRemoveFromCartModal();
    } else showToast('Ошибка удаления', 'error');
};

window.removeFromCart = async function (productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        if (typeof loadCart === 'function') await loadCart();
        showToast('Товар удалён из корзины', 'success');
    } else showToast('Ошибка удаления', 'error');
};

window.addReview = async function (productId, productName, rating, reviewText) {
    const userId = getCurrentUserId();
    if (!userId) {
        showToast('Сначала выберите пользователя', 'error');
        return false;
    }
    if (!rating || rating < 1 || rating > 5) {
        showToast('Оценка должна быть от 1 до 5', 'error');
        return false;
    }
    try {
        const resp = await fetch('https://localhost:7062/api/Reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, rating: rating, review_text: reviewText })
        });
        if (resp.status === 409) {
            const error = await resp.json();
            showToast(error.message || 'Вы уже оставляли отзыв на этот товар', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        showToast(`Отзыв на товар «${productName}» добавлен`, 'success');
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        if (typeof loadOrders === 'function') await loadOrders();
        return true;
    } catch (err) {
        showToast('Ошибка добавления отзыва', 'error');
        return false;
    }
};

window.deleteReview = async function (productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить отзыв?')) return;
    const resp = await fetch(`https://localhost:7062/api/Reviews/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        if (typeof loadOrders === 'function') await loadOrders();
        showToast('Отзыв удалён', 'success');
    } else showToast('Ошибка удаления', 'error');
};