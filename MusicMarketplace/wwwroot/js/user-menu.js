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
        })
        .catch(err => console.error(err));
}

function initUserMenu() {
    const select = document.getElementById('user-select');
    if (select) {
        select.addEventListener('change', (e) => onUserChange(parseInt(e.target.value), true, true));
    }
    loadUsers();
    highlightActiveNavItem();
}

window.initUserMenu = initUserMenu;