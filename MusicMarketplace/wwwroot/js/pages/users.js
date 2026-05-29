(function () {
    document.addEventListener('DOMContentLoaded', async () => {
        await window.UserForm.loadTable();
        window.UserForm.initLiveValidation();

        document.getElementById('user-submit')?.addEventListener('click', () => window.UserForm.save());
        document.getElementById('user-cancel')?.addEventListener('click', () => window.UserForm.clearForm());
        document.getElementById('apply-filters')?.addEventListener('click', () => window.UserForm.loadTable());
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            document.getElementById('sort-by').value = 'date_desc';
            window.UserForm.loadTable();
        });
    });
})();