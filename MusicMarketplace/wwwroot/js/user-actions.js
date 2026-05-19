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
    const data = {
        user_id: userId,
        product_id: productId
    };
    try {
        const resp = await fetch('https://localhost:7062/api/Wishlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            showToast('Товар уже в вишлисте', 'warning');
            return false;
        }
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('Ошибка добавления в вишлист:', errorText);
            showToast('Ошибка добавления в вишлист', 'error');
            return false;
        }
        showToast(`Товар «${productName}» добавлен в вишлист`, 'success');
        return true;
    } catch (err) {
        console.error(err);
        showToast('Ошибка добавления в вишлист', 'error');
        return false;
    }
}

async function addToCart(productId, productName, quantity = 1) {
    const userId = getCurrentUserId();
    if (!userId) {
        showToast('Сначала выберите пользователя', 'error');
        return false;
    }
    const data = {
        user_id: userId,
        product_id: productId,
        quantity: quantity
    };
    try {
        const resp = await fetch('https://localhost:7062/api/Carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            showToast('Товар уже в корзине', 'warning');
            return false;
        }
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('Ошибка добавления в корзину:', errorText);
            showToast('Ошибка добавления в корзину', 'error');
            return false;
        }
        showToast(`Товар «${productName}» добавлен в корзину`, 'success');
        return true;
    } catch (err) {
        console.error(err);
        showToast('Ошибка добавления в корзину', 'error');
        return false;
    }
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
    const data = {
        user_id: userId,
        product_id: productId,
        rating: rating,
        review_text: reviewText || null
    };
    try {
        const resp = await fetch('https://localhost:7062/api/Reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            showToast('Вы уже оставляли отзыв на этот товар', 'warning');
            return false;
        }
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('Ошибка добавления отзыва:', errorText);
            showToast('Ошибка добавления отзыва', 'error');
            return false;
        }
        showToast(`Отзыв на товар «${productName}» добавлен`, 'success');
        return true;
    } catch (err) {
        console.error(err);
        showToast('Ошибка добавления отзыва', 'error');
        return false;
    }
}

async function removeFromWishlist(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить из вишлиста?')) return;
    const resp = await fetch(`https://localhost:7062/api/Wishlists/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadUserStatus();
        if (typeof renderCatalog === 'function') renderCatalog();
        showToast('Товар удалён из вишлиста', 'success');
    } else showToast('Ошибка удаления', 'error');
}

async function removeFromCart(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить из корзины?')) return;
    const resp = await fetch(`https://localhost:7062/api/Carts/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadUserStatus();
        if (typeof renderCatalog === 'function') renderCatalog();
        showToast('Товар удалён из корзины', 'success');
    } else showToast('Ошибка удаления', 'error');
}

async function deleteReview(productId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (!confirm('Удалить отзыв?')) return;
    const resp = await fetch(`https://localhost:7062/api/Reviews/${userId}/${productId}`, { method: 'DELETE' });
    if (resp.ok) {
        await loadUserStatus();
        if (typeof renderCatalog === 'function') renderCatalog();
        showToast('Отзыв удалён', 'success');
    } else showToast('Ошибка удаления', 'error');
}