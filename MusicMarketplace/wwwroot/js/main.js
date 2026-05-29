(function () {
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
        });
        document.getElementById('cart-confirm-btn')?.addEventListener('click', function () {
            if (window.currentProductForCart) {
                let quantity = parseInt(document.getElementById('cart-quantity').value);
                if (isNaN(quantity) || quantity < 1) {
                    window.showToast('Введите корректное целое количество', 'error');
                    return;
                }
                quantity = Math.floor(quantity);
                window.addToCart(window.currentProductForCart.id, window.currentProductForCart.name, quantity);
                window.hideCartModal();
            }
        });
        document.getElementById('cart-cancel-btn')?.addEventListener('click', function () {
            window.hideCartModal();
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();