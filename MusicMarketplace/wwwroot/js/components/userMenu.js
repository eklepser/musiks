window.highlightActiveNavItem = function () {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        let cleanHref = href.replace(/^\.?\//, '');
        let cleanCurrent = currentPath.replace(/^\/+/, '');
        if (cleanCurrent === '' || cleanCurrent === 'index.html') cleanCurrent = 'index.html';
        if (cleanHref === cleanCurrent) link.classList.add('active');
        else link.classList.remove('active');
    });
    const usersLink = document.querySelector('.nav-menu .users-link');
    if (usersLink && currentPath.includes('/users')) usersLink.classList.add('active');
    else if (usersLink) usersLink.classList.remove('active');
};

window.loadUsers = function () {
    const select = document.getElementById('user-select');
    if (!select) return;
    fetch(window.API_URLS.USERS)
        .then(resp => resp.json())
        .then(users => {
            select.innerHTML = '<option value="">-- Выберите пользователя --</option>';
            users.forEach(user => {
                const opt = document.createElement('option');
                opt.value = user.user_id;
                opt.textContent = `${user.full_name} (${user.login})`;
                select.appendChild(opt);
            });
            const savedId = localStorage.getItem('currentUserId');
            if (savedId) {
                select.value = savedId;
                window.onUserChange(parseInt(savedId), false, false);
            }
        })
        .catch(err => console.error(err));
};

window.onUserChange = function (userId, reload = true, showNotification = true) {
    if (!userId) {
        localStorage.removeItem('currentUserId');
        window.currentUser = null;
        if (reload && window.location.pathname !== '/user.html') window.location.reload();
        else if (window.location.pathname === '/user.html' && typeof window.loadDashboard === 'function') window.loadDashboard();
        return;
    }
    fetch(`${window.API_URLS.USERS}/${userId}`)
        .then(resp => resp.json())
        .then(user => {
            window.currentUser = user;
            localStorage.setItem('currentUserId', userId);
            if (showNotification && typeof window.showToast === 'function') window.showToast(`Выбран пользователь: ${user.full_name}`, 'success');
            if (reload && window.location.pathname !== '/user.html') window.location.reload();
            else if (window.location.pathname === '/user.html' && typeof window.loadDashboard === 'function') window.loadDashboard();
        })
        .catch(err => console.error(err));
};

window.openUsersManagement = function () {
    window.location.href = '/users.html';
};

window.initUserMenu = function () {
    const select = document.getElementById('user-select');
    if (select) {
        select.removeEventListener('change', select._changeHandler);
        select._changeHandler = (e) => window.onUserChange(parseInt(e.target.value), true, true);
        select.addEventListener('change', select._changeHandler);
    }
    const manageBtn = document.getElementById('manage-users-btn');
    if (manageBtn) {
        manageBtn.removeEventListener('click', manageBtn._clickHandler);
        manageBtn._clickHandler = window.openUsersManagement;
        manageBtn.addEventListener('click', manageBtn._clickHandler);
    }
    window.loadUsers();
    window.highlightActiveNavItem();
    setTimeout(function () {
        if (typeof window.initToggleFilters === 'function') window.initToggleFilters();
    }, 100);
};