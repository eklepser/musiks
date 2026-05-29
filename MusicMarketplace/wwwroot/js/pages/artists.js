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

                if (tabName === 'artists') {
                    await window.ArtistConcertForms.loadArtists();
                    await window.ArtistConcertForms.renderArtistsTable();
                } else if (tabName === 'concerts') {
                    await Promise.all([window.ArtistConcertForms.loadArtists(), window.ArtistConcertForms.loadConcerts(), window.ArtistConcertForms.loadArtistConcerts()]);
                    await window.ArtistConcertForms.loadArtistOptions();
                    await window.ArtistConcertForms.renderConcertsTable();
                }
                setTimeout(function () {
                    if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
                }, 50);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await window.ArtistConcertForms.loadArtists();
        await window.ArtistConcertForms.loadConcerts();
        await window.ArtistConcertForms.loadArtistConcerts();
        await window.ArtistConcertForms.loadArtistOptions();
        await window.ArtistConcertForms.renderArtistsTable();
        await window.ArtistConcertForms.renderConcertsTable();
        window.ArtistConcertForms.initArtistLiveValidation();
        window.ArtistConcertForms.initConcertLiveValidation();

        document.getElementById('apply-artist-filters')?.addEventListener('click', () => window.ArtistConcertForms.renderArtistsTable());
        document.getElementById('clear-artist-filters')?.addEventListener('click', () => {
            document.getElementById('artist-search-name').value = '';
            document.getElementById('artist-search-country').value = '';
            document.getElementById('artist-search-language').value = '';
            document.getElementById('artist-sort').value = 'name_asc';
            window.ArtistConcertForms.renderArtistsTable();
        });
        document.getElementById('apply-concert-filters')?.addEventListener('click', () => window.ArtistConcertForms.renderConcertsTable());
        document.getElementById('clear-concert-filters')?.addEventListener('click', () => {
            document.getElementById('concert-search-title').value = '';
            document.getElementById('concert-search-venue').value = '';
            document.getElementById('concert-search-status').value = '';
            document.getElementById('concert-search-artist').value = '';
            document.getElementById('concert-sort').value = 'date_asc';
            window.ArtistConcertForms.renderConcertsTable();
        });
        document.getElementById('artist-submit')?.addEventListener('click', () => window.ArtistConcertForms.saveArtist());
        document.getElementById('artist-cancel')?.addEventListener('click', () => window.ArtistConcertForms.clearArtistForm());
        document.getElementById('concert-submit')?.addEventListener('click', () => window.ArtistConcertForms.saveConcert());
        document.getElementById('concert-cancel')?.addEventListener('click', () => window.ArtistConcertForms.clearConcertForm());
        document.getElementById('open-artists-modal-btn')?.addEventListener('click', () => window.ArtistConcertForms.openArtistsModal());
        document.getElementById('modal-add-artist')?.addEventListener('click', () => window.ArtistConcertForms.addArtistFromModal());
        document.getElementById('modal-close')?.addEventListener('click', () => window.ArtistConcertForms.closeArtistsModal());

        initTabs();
    });
})();
        document.getElementById('artist-submit')?.addEventListener('click', () => window.ArtistConcertForms.saveArtist());
        document.getElementById('artist-cancel')?.addEventListener('click', () => window.ArtistConcertForms.clearArtistForm());
        document.getElementById('concert-submit')?.addEventListener('click', () => window.ArtistConcertForms.saveConcert());
        document.getElementById('concert-cancel')?.addEventListener('click', () => window.ArtistConcertForms.clearConcertForm());
        document.getElementById('open-artists-modal-btn')?.addEventListener('click', () => window.ArtistConcertForms.openArtistsModal());
        document.getElementById('modal-add-artist')?.addEventListener('click', () => window.ArtistConcertForms.addArtistFromModal());
        document.getElementById('modal-close')?.addEventListener('click', () => window.ArtistConcertForms.closeArtistsModal());

        initTabs();
    });
})();