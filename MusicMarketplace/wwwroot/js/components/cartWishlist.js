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

    if (quantity < 1) {
        window.showToast('Количество должно быть не менее 1', 'error');
        return false;
    }
    if (quantity > 10000) {
        window.showToast('Нельзя добавить более 10000 единиц товара за раз', 'error');
        return false;
    }

    try {
        const resp = await fetch(window.API_URLS.CARTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, quantity: quantity })
        });

        if (!resp.ok) {
            let errorMsg = 'Ошибка добавления в корзину';
            try {
                const error = await resp.json();
                if (error.message) errorMsg = error.message;
            } catch (e) { }
            window.showToast(errorMsg, 'error');
            return false;
        }

        let newQuantity = quantity;
        try {
            const result = await resp.json();
            if (result && result.quantity) newQuantity = result.quantity;
        } catch (e) { }

        window.showToast(`Товар «${productName}» добавлен в корзину${newQuantity > 1 ? ` (теперь ${newQuantity} шт.)` : ''}`, 'success');
        if (typeof window.loadCart === 'function') await window.loadCart();
        return true;
    } catch (err) {
        window.showToast('Ошибка сети', 'error');
        return false;
    }
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

// НОВАЯ ФУНКЦИЯ ДЛЯ ПРОСМОТРА ОТЗЫВОВ (ДОБАВЛЕНА)
window.showProductReviewsModal = async function (productId, productName) {
    const modal = document.getElementById('product-reviews-modal');
    if (!modal) return;
    document.getElementById('product-reviews-title').innerText = `Отзывы о товаре: ${productName}`;
    const container = document.getElementById('product-reviews-list');
    container.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    modal.style.display = 'block';
    try {
        const resp = await fetch(`${window.API_URLS.REVIEWS}/byProduct/${productId}`);
        if (resp.ok) {
            const reviews = await resp.json();
            if (reviews.length === 0) {
                container.innerHTML = '<div class="placeholder-text">Нет отзывов на этот товар</div>';
            } else {
                container.innerHTML = '';
                reviews.forEach(review => {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.className = 'review-item';
                    const ratingStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                    const date = new Date(review.review_date).toLocaleString();
                    reviewDiv.innerHTML = `
                        <div class="review-header">
                            <strong>${escapeHtml(review.user_name)}</strong>
                            <span class="review-rating">${ratingStars}</span>
                            <span class="review-date">${date}</span>
                        </div>
                        <div class="review-text">${escapeHtml(review.review_text || '')}</div>
                    `;
                    container.appendChild(reviewDiv);
                });
            }
        } else {
            container.innerHTML = '<div class="error">Ошибка загрузки отзывов</div>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="error">Ошибка сети</div>';
    }
};

window.closeProductReviewsModal = function () {
    const modal = document.getElementById('product-reviews-modal');
    if (modal) modal.style.display = 'none';
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}