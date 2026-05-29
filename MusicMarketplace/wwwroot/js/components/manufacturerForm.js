window.ManufacturerForm = (function () {
    let editId = null;

    async function loadTable() {
        const searchName = document.getElementById('manufacturer-search-name')?.value.trim() || '';
        const searchCountry = document.getElementById('manufacturer-search-country')?.value.trim() || '';
        const sortBy = document.getElementById('manufacturer-sort')?.value || 'name_asc';
        let url = `${window.API_URLS.MANUFACTURERS}/filter?`;
        if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
        if (searchCountry) url += `searchCountry=${encodeURIComponent(searchCountry)}&`;
        if (sortBy) url += `sortBy=${sortBy}&`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            let items = await resp.json();
            const tbody = document.getElementById('manufacturers-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="centered-message">Нет данных</tbody>';
                document.getElementById('manufacturer-found-count').innerText = '0';
                return;
            }
            document.getElementById('manufacturer-found-count').innerText = items.length;
            items.forEach(item => {
                const row = tbody.insertRow();
                row.insertCell(0).textContent = item.manufacturer_id;
                row.insertCell(1).textContent = item.name;
                row.insertCell(2).textContent = item.contact_info || '';
                row.insertCell(3).textContent = item.country || '';
                const actions = row.insertCell(4);
                const btnRow = document.createElement('div');
                btnRow.className = 'action-buttons-row';
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Редактировать';
                editBtn.className = 'edit-btn';
                editBtn.onclick = () => window.ManufacturerForm.fillForm(item);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => window.ManufacturerForm.deleteItem(item.manufacturer_id, item.name);
                btnRow.append(editBtn, delBtn);
                actions.appendChild(btnRow);
            });
        } catch (err) {
            const tbody = document.getElementById('manufacturers-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="centered-message">Ошибка загрузки</tbody>';
            document.getElementById('manufacturer-found-count').innerText = '0';
        }
    }

    function fillForm(item) {
        const titleEl = document.querySelector('#manufacturers-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Редактирование производителя';
        document.getElementById('manufacturer-name').value = item.name;
        document.getElementById('manufacturer-contact').value = item.contact_info || '';
        document.getElementById('manufacturer-country').value = item.country || '';
        document.getElementById('manufacturer-edit-id').value = item.manufacturer_id;
        editId = item.manufacturer_id;
        document.getElementById('manufacturer-submit').innerText = 'Сохранить';
        document.getElementById('manufacturer-cancel').style.display = 'inline-block';
        ['manufacturer-name', 'manufacturer-contact', 'manufacturer-country'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
        setTimeout(() => {
            if (document.getElementById('manufacturer-name') && typeof window.validateRequiredString === 'function') {
                const error = window.validateRequiredString(document.getElementById('manufacturer-name').value, 'Название', 2, 100, true);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('manufacturer-name'), !error, error);
            }
            if (document.getElementById('manufacturer-contact') && typeof window.validateContactInfo === 'function') {
                const error = window.validateContactInfo(document.getElementById('manufacturer-contact').value);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('manufacturer-contact'), !error, error);
            }
            if (document.getElementById('manufacturer-country') && document.getElementById('manufacturer-country').value.trim() && typeof window.validateOptionalString === 'function') {
                const error = window.validateOptionalString(document.getElementById('manufacturer-country').value, 'Страна', 50);
                if (typeof window.setFieldValidity === 'function') window.setFieldValidity(document.getElementById('manufacturer-country'), !error, error);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearForm() {
        const titleEl = document.querySelector('#manufacturers-tab .add-section-card h3');
        if (titleEl) titleEl.textContent = 'Добавление производителя';
        document.getElementById('manufacturer-name').value = '';
        document.getElementById('manufacturer-contact').value = '';
        document.getElementById('manufacturer-country').value = '';
        document.getElementById('manufacturer-edit-id').value = '';
        editId = null;
        document.getElementById('manufacturer-submit').innerText = 'Добавить';
        document.getElementById('manufacturer-cancel').style.display = 'none';
        ['manufacturer-name', 'manufacturer-contact', 'manufacturer-country'].forEach(id => {
            const el = document.getElementById(id);
            if (el && typeof window.clearFieldValidity === 'function') window.clearFieldValidity(el);
        });
    }

    function validateFields(name, contact, country) {
        let err = window.validateRequiredString(name, 'Название', 2, 100, true);
        if (err) return err;
        if (!contact || contact.trim() === '') return 'Контактные данные обязательны';
        err = window.validateContactInfo(contact);
        if (err) return err;
        if (country && country.trim() !== '') {
            err = window.validateOptionalString(country, 'Страна', 50);
            if (err) return err;
        }
        return null;
    }

    async function save() {
        const id = document.getElementById('manufacturer-edit-id').value;
        const name = document.getElementById('manufacturer-name').value.trim();
        const contact = document.getElementById('manufacturer-contact').value.trim();
        const country = document.getElementById('manufacturer-country').value.trim();
        const validationError = validateFields(name, contact, country);
        if (validationError) { window.showToast(validationError, 'error'); return; }
        const data = { name, contact_info: contact, country: country === '' ? null : country };
        let url = window.API_URLS.MANUFACTURERS, method = 'POST', isUpdate = false;
        if (id) {
            data.manufacturer_id = parseInt(id);
            url += `/${id}`;
            method = 'PUT';
            isUpdate = true;
        }
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!resp.ok) {
                const error = await resp.json();
                let msg = 'Ошибка сохранения';
                if (error.message) msg = error.message;
                else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
                window.showToast(msg, 'error');
                return;
            }
            let newId = id;
            if (!id) newId = (await resp.json()).manufacturer_id;
            clearForm();
            await loadTable();
            if (typeof window.loadManufacturersForSelect === 'function') {
                await window.loadManufacturersForSelect('filter-manufacturer');
                await window.loadManufacturersForSelect('ticket-manufacturer-id');
                await window.loadManufacturersForSelect('clothing-manufacturer-id');
                await window.loadManufacturersForSelect('accessory-manufacturer-id');
                await window.loadManufacturersForSelect('edit-ticket-manufacturer-id');
                await window.loadManufacturersForSelect('edit-clothing-manufacturer-id');
                await window.loadManufacturersForSelect('edit-accessory-manufacturer-id');
            }
            window.showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
        } catch (err) { window.showToast('Ошибка сохранения', 'error'); }
    }

    async function deleteItem(id, name) {
        const confirmed = await window.showConfirmModal({
            title: 'Удаление производителя',
            message: `Удалить производителя «${name}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const resp = await fetch(`${window.API_URLS.MANUFACTURERS}/${id}`, { method: 'DELETE' });
            if (!resp.ok) {
                const error = await resp.json();
                window.showToast(error.message || 'Невозможно удалить производителя', 'error');
                return;
            }
            clearForm();
            await loadTable();
            if (typeof window.loadManufacturersForSelect === 'function') {
                await window.loadManufacturersForSelect('filter-manufacturer');
                await window.loadManufacturersForSelect('ticket-manufacturer-id');
                await window.loadManufacturersForSelect('clothing-manufacturer-id');
                await window.loadManufacturersForSelect('accessory-manufacturer-id');
                await window.loadManufacturersForSelect('edit-ticket-manufacturer-id');
                await window.loadManufacturersForSelect('edit-clothing-manufacturer-id');
                await window.loadManufacturersForSelect('edit-accessory-manufacturer-id');
            }
            window.showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
    }

    function initLiveValidation() {
        const fields = [
            { id: 'manufacturer-name', required: true, validator: (v) => window.validateRequiredString(v, 'Название', 2, 100, true) },
            { id: 'manufacturer-contact', required: true, validator: (v) => v ? window.validateContactInfo(v) : 'Контактные данные обязательны' },
            { id: 'manufacturer-country', required: false, validator: (v) => v && v.trim() ? window.validateOptionalString(v, 'Страна', 50) : null }
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

window.loadManufacturersTable = function () {
    return window.ManufacturerForm.loadTable();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ManufacturerForm.initLiveValidation());
} else {
    window.ManufacturerForm.initLiveValidation();
}