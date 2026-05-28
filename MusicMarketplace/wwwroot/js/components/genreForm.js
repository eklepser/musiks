// js/components/genreForm.js
window.GenreForm = (function () {
    let editId = null;

    async function loadTable() {
        const searchName = document.getElementById('genre-search-name')?.value.trim() || '';
        const sortBy = document.getElementById('genre-sort')?.value || 'name_asc';
        let url = `${window.API_URLS.GENRES}/filter?`;
        if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
        if (sortBy) url += `sortBy=${sortBy}&`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            let items = await resp.json();
            const tbody = document.getElementById('genres-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (items.length === 0) {
                tbody.innerHTML = '<td><td colspan="4" class="centered-message">Нет данных</tbody>';
                document.getElementById('genre-found-count').innerText = '0';
                return;
            }
            document.getElementById('genre-found-count').innerText = items.length;
            items.forEach(item => {
                const row = tbody.insertRow();
                row.insertCell(0).textContent = item.genre_id;
                row.insertCell(1).textContent = item.name;
                row.insertCell(2).textContent = item.description || '';
                const actions = row.insertCell(3);
                const btnRow = document.createElement('div');
                btnRow.className = 'action-buttons-row';
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Редактировать';
                editBtn.className = 'edit-btn';
                editBtn.onclick = () => window.GenreForm.fillForm(item);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => window.GenreForm.deleteItem(item.genre_id, item.name);
                btnRow.append(editBtn, delBtn);
                actions.appendChild(btnRow);
            });
        } catch (err) {
            const tbody = document.getElementById('genres-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="centered-message">Ошибка загрузки</tbody>';
            document.getElementById('genre-found-count').innerText = '0';
        }
    }

    function fillForm(item) {
        const titleEl = document.querySelector('#genres-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Редактирование жанра';
        document.getElementById('genre-name').value = item.name;
        document.getElementById('genre-description').value = item.description || '';
        document.getElementById('genre-edit-id').value = item.genre_id;
        editId = item.genre_id;
        document.getElementById('genre-submit').innerText = 'Сохранить';
        document.getElementById('genre-cancel').style.display = 'inline-block';
        if (typeof window.clearFieldValidity === 'function') {
            window.clearFieldValidity(document.getElementById('genre-name'));
            window.clearFieldValidity(document.getElementById('genre-description'));
        }
        setTimeout(() => {
            if (document.getElementById('genre-name') && typeof window.validateRequiredString === 'function') {
                const error = window.validateRequiredString(document.getElementById('genre-name').value, 'Название', 2, 50, true);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('genre-name'), !error, error);
            }
            if (document.getElementById('genre-description') && document.getElementById('genre-description').value.trim() && typeof window.validateOptionalString === 'function') {
                const error = window.validateOptionalString(document.getElementById('genre-description').value, 'Описание', 500);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('genre-description'), !error, error);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearForm() {
        const titleEl = document.querySelector('#genres-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Добавление жанра';
        document.getElementById('genre-name').value = '';
        document.getElementById('genre-description').value = '';
        document.getElementById('genre-edit-id').value = '';
        editId = null;
        document.getElementById('genre-submit').innerText = 'Добавить';
        document.getElementById('genre-cancel').style.display = 'none';
        if (typeof window.clearFieldValidity === 'function') {
            window.clearFieldValidity(document.getElementById('genre-name'));
            window.clearFieldValidity(document.getElementById('genre-description'));
        }
    }

    function validateFields(name, description) {
        let err = window.validateRequiredString(name, 'Название', 2, 50, true);
        if (err) return err;
        if (description && description.trim()) {
            err = window.validateOptionalString(description, 'Описание', 500);
            if (err) return err;
        }
        return null;
    }

    async function save() {
        const id = document.getElementById('genre-edit-id').value;
        const name = document.getElementById('genre-name').value.trim();
        const description = document.getElementById('genre-description').value.trim();
        const validationError = validateFields(name, description);
        if (validationError) { window.showToast(validationError, 'error'); return; }
        const data = { name, description: description === '' ? null : description };
        let url = window.API_URLS.GENRES, method = 'POST', isUpdate = false;
        if (id) {
            data.genre_id = parseInt(id);
            url += `/${id}`;
            method = 'PUT';
            isUpdate = true;
        }
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!resp.ok) {
                const error = await resp.json().catch(() => null);
                let msg = 'Ошибка сохранения';
                if (error && error.message) msg = error.message;
                else if (error && error.errors) msg = Object.values(error.errors).flat().join('; ');
                window.showToast(msg, 'error');
                return;
            }
            let newId = id;
            if (!id) newId = (await resp.json()).genre_id;
            clearForm();
            await loadTable();
            if (typeof window.loadGenresAndLinks === 'function') await window.loadGenresAndLinks();
            window.showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
        } catch (err) { window.showToast('Ошибка сохранения', 'error'); }
    }

    async function deleteItem(id, name) {
        const confirmed = await window.showConfirmModal({
            title: 'Удаление жанра',
            message: `Удалить жанр «${name}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const resp = await fetch(`${window.API_URLS.GENRES}/${id}`, { method: 'DELETE' });
            if (!resp.ok) {
                const error = await resp.json().catch(() => null);
                window.showToast(error?.message || 'Невозможно удалить жанр', 'error');
                return;
            }
            clearForm();
            await loadTable();
            if (typeof window.loadGenresAndLinks === 'function') await window.loadGenresAndLinks();
            window.showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
    }

    function initLiveValidation() {
        const fields = [
            { id: 'genre-name', required: true, validator: (v) => window.validateRequiredString(v, 'Название', 2, 50, true) },
            { id: 'genre-description', required: false, validator: (v) => v && v.trim() ? window.validateOptionalString(v, 'Описание', 500) : null }
        ];
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el && typeof window.attachLiveValidation === 'function') {
                window.attachLiveValidation(el, f.validator, f.required);
            }
        });
    }

    return { loadTable, fillForm, clearForm, save, deleteItem, initLiveValidation };
})();

window.loadGenresTable = function () {
    return window.GenreForm.loadTable();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GenreForm.initLiveValidation());
} else {
    window.GenreForm.initLiveValidation();
}