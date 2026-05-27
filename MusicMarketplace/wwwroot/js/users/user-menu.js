function highlightActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        let cleanHref = href.replace(/^\.?\//, '');
        let cleanCurrent = currentPath.replace(/^\/+/, '');
        if (cleanCurrent === '' || cleanCurrent === 'index.html') cleanCurrent = 'index.html';
        if (cleanHref === cleanCurrent) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const usersLink = document.querySelector('.nav-menu .users-link');
    if (usersLink && currentPath.includes('/users')) {
        usersLink.classList.add('active');
    } else if (usersLink) {
        usersLink.classList.remove('active');
    }
}

let currentUser = null;

function loadUsers() {
    const select = document.getElementById('user-select');
    if (!select) return;
    fetch('https://localhost:7062/api/Users')
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
                onUserChange(parseInt(savedId), false, false);
            }
        })
        .catch(err => console.error(err));
}

function onUserChange(userId, reload = true, showNotification = true) {
    if (!userId) {
        localStorage.removeItem('currentUserId');
        currentUser = null;
        if (reload && window.location.pathname !== '/user.html') window.location.reload();
        else if (window.location.pathname === '/user.html' && typeof loadDashboard === 'function') loadDashboard();
        return;
    }
    fetch(`https://localhost:7062/api/Users/${userId}`)
        .then(resp => resp.json())
        .then(user => {
            currentUser = user;
            localStorage.setItem('currentUserId', userId);
            if (showNotification && typeof showToast === 'function') {
                showToast(`Выбран пользователь: ${user.full_name}`, 'success');
            }
            if (reload && window.location.pathname !== '/user.html') window.location.reload();
            else if (window.location.pathname === '/user.html' && typeof loadDashboard === 'function') loadDashboard();
        })
        .catch(err => console.error(err));
}

function openUsersManagement() {
    window.location.href = '/users.html';
}

function initUserMenu() {
    const select = document.getElementById('user-select');
    if (select) {
        select.removeEventListener('change', select._changeHandler);
        select._changeHandler = (e) => onUserChange(parseInt(e.target.value), true, true);
        select.addEventListener('change', select._changeHandler);
    }
    const manageBtn = document.getElementById('manage-users-btn');
    if (manageBtn) {
        manageBtn.removeEventListener('click', manageBtn._clickHandler);
        manageBtn._clickHandler = openUsersManagement;
        manageBtn.addEventListener('click', manageBtn._clickHandler);
    }
    loadUsers();
    highlightActiveNavItem();
    setTimeout(function () {
        if (typeof initToggleFilters === 'function') initToggleFilters();
    }, 100);
}

window.initUserMenu = initUserMenu;
window.onUserChange = onUserChange;
window.openUsersManagement = openUsersManagement;