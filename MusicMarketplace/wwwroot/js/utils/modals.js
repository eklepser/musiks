window.showConfirmModal = function (options) {
    return new Promise((resolve) => {
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content confirm-modal-content">
                    <h3 id="confirm-title">Подтверждение</h3>
                    <p id="confirm-message">Вы уверены?</p>
                    <div class="confirm-buttons">
                        <button id="confirm-yes-btn" class="delete-btn">Да, удалить</button>
                        <button id="confirm-no-btn" class="cancel-btn">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const yesBtn = document.getElementById('confirm-yes-btn');
        const noBtn = document.getElementById('confirm-no-btn');
        if (options.title) titleEl.textContent = options.title;
        if (options.message) messageEl.textContent = options.message;
        if (options.yesText) yesBtn.textContent = options.yesText;
        if (options.noText) noBtn.textContent = options.noText;
        modal.style.display = 'block';
        const onYes = () => {
            modal.style.display = 'none';
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            window.removeEventListener('click', outsideClick);
            resolve(true);
        };
        const onNo = () => {
            modal.style.display = 'none';
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            window.removeEventListener('click', outsideClick);
            resolve(false);
        };
        const outsideClick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                yesBtn.removeEventListener('click', onYes);
                noBtn.removeEventListener('click', onNo);
                window.removeEventListener('click', outsideClick);
                resolve(false);
            }
        };
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        window.addEventListener('click', outsideClick);
    });
};

window.showModal = function (modalId, display = 'block') {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = display;
};

window.hideModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};