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
        if (typeof window.loadAllArtists === 'function') window.loadAllArtists();
        if (typeof window.loadGenresAndLinks === 'function') window.loadGenresAndLinks();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();