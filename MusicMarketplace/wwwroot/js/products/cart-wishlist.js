function getCurrentUserId() {
    const savedId = localStorage.getItem('currentUserId');
    return savedId ? parseInt(savedId) : null;
}

async function addToWishlist(productId, productName) {
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
            showToast('Товар уже в вишлисте', 'warning');
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
}

async function removeFromWishlist(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить из вишлиста?')) return;
    const resp = await fetch(`https://localhost:7062/api/Wishlists/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        showToast('Товар удалён из вишлиста', 'success');
    } else showToast('Ошибка удаления', 'error');
}

async function addToCart(productId, productName, quantity = 1) {
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        showToast(`Товар «${productName}» добавлен в корзину`, 'success');
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        return true;
    } catch (err) {
        showToast('Ошибка добавления в корзину', 'error');
        return false;
    }
}

async function removeFromCart(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить из корзины?')) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        showToast('Товар удалён из корзины', 'success');
    } else showToast('Ошибка удаления', 'error');
}

async function addReview(productId, productName, rating, reviewText) {
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
            showToast('Вы уже оставляли отзыв на этот товар', 'warning');
            return false;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        showToast(`Отзыв на товар «${productName}» добавлен`, 'success');
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        return true;
    } catch (err) {
        showToast('Ошибка добавления отзыва', 'error');
        return false;
    }
}

async function deleteReview(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить отзыв?')) return;
    const resp = await fetch(`https://localhost:7062/api/Reviews/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        if (typeof loadUserStatus === 'function') await loadUserStatus();
        showToast('Отзыв удалён', 'success');
    } else showToast('Ошибка удаления', 'error');
}