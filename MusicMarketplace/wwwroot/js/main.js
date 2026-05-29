(function () {
    function validatePositiveInteger(value) {
        if (value === '' || value === null || value === undefined) return false;
        const num = Number(value);
        if (isNaN(num)) return false;
        if (!Number.isInteger(num)) return false;
        if (num <= 0) return false;
        if (value.toString().startsWith('0') && value.toString().length > 1) return false;
        if (value.toString().includes('.') || value.toString().includes(',')) return false;
        return true;
    }

    function initAll() {
        if (typeof window.initUserMenu === 'function') window.initUserMenu();
        if (typeof window.initAllValidations === 'function') window.initAllValidations();
        if (typeof window.initNumericInputs === 'function') window.initNumericInputs();
        if (typeof window.initLettersOnlyInputs === 'function') window.initLettersOnlyInputs();
        if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
        if (typeof window.initToggleAddSections === 'function') window.initToggleAddSections();
        if (typeof window.initCountrySelect === 'function') window.initCountrySelect();
        if (typeof window.initLanguageSelect === 'function') window.initLanguageSelect();
        if (typeof window.loadManufacturerNameDatalist === 'function') window.loadManufacturerNameDatalist();
        if (typeof window.loadManufacturerCountryDatalist === 'function') window.loadManufacturerCountryDatalist();
        if (typeof window.loadGenreNameDatalist === 'function') window.loadGenreNameDatalist();
        if (typeof window.loadProductNamesDatalist === 'function') window.loadProductNamesDatalist();
        if (typeof window.loadArtistsForFilter === 'function') window.loadArtistsForFilter();
        if (typeof window.loadAllArtists === 'function') window.loadAllArtists();
        if (typeof window.loadGenresAndLinks === 'function') window.loadGenresAndLinks();

        const integerInputs = document.querySelectorAll('#cart-quantity, #remove-cart-quantity');
        integerInputs.forEach(input => {
            input.setAttribute('data-integer', 'true');
            input.inputMode = 'numeric';
        });

        document.getElementById('cart-confirm-btn')?.addEventListener('click', function () {
            if (window.currentProductForCart) {
                const quantityInput = document.getElementById('cart-quantity');
                const value = quantityInput.value.trim();
                if (!validatePositiveInteger(value)) {
                    window.showToast('Количество должно быть целым положительным числом (1, 2, 3...)', 'error');
                    return;
                }
                const quantity = parseInt(value, 10);
                window.addToCart(window.currentProductForCart.id, window.currentProductForCart.name, quantity);
                window.hideCartModal();
            }
        });

        document.getElementById('cart-cancel-btn')?.addEventListener('click', function () {
            window.hideCartModal();
        });

        document.getElementById('remove-cart-confirm-btn')?.addEventListener('click', function () {
            if (window.currentProductForRemove) {
                const quantityInput = document.getElementById('remove-cart-quantity');
                const value = quantityInput.value.trim();
                if (!validatePositiveInteger(value)) {
                    window.showToast('Количество должно быть целым положительным числом (1, 2, 3...)', 'error');
                    return;
                }
                let quantity = parseInt(value, 10);
                if (quantity > window.currentProductForRemove.currentQuantity) {
                    window.showToast(`Нельзя удалить больше, чем есть в корзине (${window.currentProductForRemove.currentQuantity})`, 'error');
                    return;
                }
                window.removeFromCartWithQuantity(window.currentProductForRemove.id, quantity);
            }
        });

        document.getElementById('remove-cart-cancel-btn')?.addEventListener('click', function () {
            window.hideRemoveFromCartModal();
        });

        const cartQuantity = document.getElementById('cart-quantity');
        if (cartQuantity) {
            cartQuantity.addEventListener('input', function (e) {
                const val = this.value;
                if (val !== '' && (!validatePositiveInteger(val))) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
        const removeQuantity = document.getElementById('remove-cart-quantity');
        if (removeQuantity) {
            removeQuantity.addEventListener('input', function (e) {
                const val = this.value;
                if (val !== '' && (!validatePositiveInteger(val))) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();