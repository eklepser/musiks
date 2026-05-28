// js/pages/user.js
(function () {
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tabName = e.currentTarget.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const activeTab = document.getElementById(`${tabName}-tab`);
                if (activeTab) activeTab.classList.add('active');

                if (tabName === 'wishlist') await window.loadWishlist();
                else if (tabName === 'cart') await window.loadCart();
                else if (tabName === 'orders') await window.loadOrders();
                else if (tabName === 'reviews') await window.loadReviews();

                setTimeout(function () {
                    if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
                }, 50);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await window.loadDashboard();
        document.getElementById('wishlist-apply')?.addEventListener('click', () => window.loadWishlist());
        document.getElementById('wishlist-reset')?.addEventListener('click', () => {
            document.getElementById('wishlist-search').value = '';
            document.getElementById('wishlist-sort').value = 'date_desc';
            window.loadWishlist();
        });
        document.getElementById('cart-apply')?.addEventListener('click', () => window.loadCart());
        document.getElementById('cart-reset')?.addEventListener('click', () => {
            document.getElementById('cart-search').value = '';
            document.getElementById('cart-sort').value = 'date_desc';
            window.loadCart();
        });
        document.getElementById('reviews-filter')?.addEventListener('click', () => window.loadReviews());
        document.getElementById('reviews-reset')?.addEventListener('click', () => {
            document.getElementById('reviews-search').value = '';
            document.getElementById('reviews-rating').value = '';
            document.getElementById('reviews-sort').value = 'date_desc';
            window.loadReviews();
        });
        document.getElementById('orders-apply')?.addEventListener('click', () => window.loadOrders());
        document.getElementById('orders-reset')?.addEventListener('click', () => {
            document.getElementById('orders-status').value = '';
            document.getElementById('orders-date-from').value = '';
            document.getElementById('orders-date-to').value = '';
            document.getElementById('orders-sort').value = 'date_desc';
            window.loadOrders();
        });
        document.getElementById('checkout-btn')?.addEventListener('click', () => window.checkout());
        document.getElementById('cart-confirm-btn')?.addEventListener('click', () => {
            if (window.currentProductForCart) {
                const quantity = parseInt(document.getElementById('cart-quantity').value);
                window.addToCart(window.currentProductForCart.id, window.currentProductForCart.name, quantity);
                window.hideCartModal();
            }
        });
        document.getElementById('cart-cancel-btn')?.addEventListener('click', () => window.hideCartModal());
        document.getElementById('review-confirm-btn')?.addEventListener('click', () => {
            if (window.currentProductForReview) {
                const rating = parseInt(document.getElementById('review-rating').value);
                const reviewText = document.getElementById('review-text').value;
                window.addReview(window.currentProductForReview.id, window.currentProductForReview.name, rating, reviewText);
                window.hideReviewModal();
                window.loadReviews();
            }
        });
        document.getElementById('review-cancel-btn')?.addEventListener('click', () => window.hideReviewModal());
        document.getElementById('remove-cart-confirm-btn')?.addEventListener('click', () => {
            if (window.currentProductForRemove) {
                const quantity = parseInt(document.getElementById('remove-cart-quantity').value);
                if (quantity && quantity > 0 && quantity <= window.currentProductForRemove.currentQuantity) {
                    window.removeFromCartWithQuantity(window.currentProductForRemove.id, quantity);
                } else {
                    window.showToast('Некорректное количество', 'error');
                }
            }
        });
        document.getElementById('remove-cart-cancel-btn')?.addEventListener('click', () => window.hideRemoveFromCartModal());
        document.getElementById('checkout-confirm-btn')?.addEventListener('click', () => window.confirmCheckout());
        document.getElementById('checkout-cancel-btn')?.addEventListener('click', () => window.hideCheckoutModal());
        document.getElementById('modal-order-close')?.addEventListener('click', () => window.closeOrderModal());

        initTabs();
    });
})();