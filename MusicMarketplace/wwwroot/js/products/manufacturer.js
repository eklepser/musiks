let manufacturerEditId = null;
async function loadManufacturersTable() {
    const searchName = document.getElementById('manufacturer-search-name');
    const searchCountry = document.getElementById('manufacturer-search-country');
    const sortBy = document.getElementById('manufacturer-sort');
    if (!searchName || !searchCountry || !sortBy) return;
    const searchNameValue = searchName.value.trim();
    const searchCountryValue = searchCountry.value.trim();
    const sortByValue = sortBy.value;
    let url = `https://localhost:7062/api/Manufacturers/filter?`;
    if (searchNameValue) url += `searchName=${encodeURIComponent(searchNameValue)}&`;
    if (searchCountryValue) url += `searchCountry=${encodeURIComponent(searchCountryValue)}&`;
    if (sortByValue) url += `sortBy=${sortByValue}&`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        const tbody = document.getElementById('manufacturers-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="centered-message">Нет данных</td></tr>';
            const countSpan = document.getElementById('manufacturer-found-count');
            if (countSpan) countSpan.innerText = '0';
            return;
        }
        const countSpan = document.getElementById('manufacturer-found-count');
        if (countSpan) countSpan.innerText = items.length;
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
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillManufacturerForm(item);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteManufacturer(item.manufacturer_id, item.name);
            btnRow.append(editBtn, delBtn);
            actions.appendChild(btnRow);
        });
    } catch (err) {
        const tbody = document.getElementById('manufacturers-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="centered-message">Ошибка загрузки</td></tr>';
        const countSpan = document.getElementById('manufacturer-found-count');
        if (countSpan) countSpan.innerText = '0';
    }
}
function fillManufacturerForm(item) {
    const nameInput = document.getElementById('manufacturer-name');
    const contactInput = document.getElementById('manufacturer-contact');
    const countryInput = document.getElementById('manufacturer-country');
    const editIdInput = document.getElementById('manufacturer-edit-id');
    const formTitle = document.getElementById('manufacturer-form-title');
    const submitBtn = document.getElementById('manufacturer-submit');
    const cancelBtn = document.getElementById('manufacturer-cancel');
    if (!nameInput || !contactInput || !countryInput || !editIdInput || !formTitle || !submitBtn || !cancelBtn) return;
    nameInput.value = item.name;
    contactInput.value = item.contact_info || '';
    countryInput.value = item.country || '';
    editIdInput.value = item.manufacturer_id;
    manufacturerEditId = item.manufacturer_id;
    formTitle.innerText = 'Редактировать производителя';
    submitBtn.innerText = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function clearManufacturerForm() {
    const nameInput = document.getElementById('manufacturer-name');
    const contactInput = document.getElementById('manufacturer-contact');
    const countryInput = document.getElementById('manufacturer-country');
    const editIdInput = document.getElementById('manufacturer-edit-id');
    const formTitle = document.getElementById('manufacturer-form-title');
    const submitBtn = document.getElementById('manufacturer-submit');
    const cancelBtn = document.getElementById('manufacturer-cancel');
    if (nameInput) nameInput.value = '';
    if (contactInput) contactInput.value = '';
    if (countryInput) countryInput.value = '';
    if (editIdInput) editIdInput.value = '';
    manufacturerEditId = null;
    if (formTitle) formTitle.innerText = 'Добавить производителя';
    if (submitBtn) submitBtn.innerText = 'Добавить';
    if (cancelBtn) cancelBtn.style.display = 'none';
}
function validateManufacturerFields(name, contact, country) {
    let err = validateRequiredString(name, 'Название', 2, 100, true);
    if (err) return err;
    if (contact && contact.trim() !== '') {
        err = validateContactInfo(contact);
        if (err) return err;
    }
    if (country && country.trim() !== '') {
        err = validateOptionalString(country, 'Страна', 50);
        if (err) return err;
    }
    return null;
}
async function saveManufacturer() {
    const editId = document.getElementById('manufacturer-edit-id');
    const nameInput = document.getElementById('manufacturer-name');
    const contactInput = document.getElementById('manufacturer-contact');
    const countryInput = document.getElementById('manufacturer-country');
    if (!editId || !nameInput || !contactInput || !countryInput) return;
    const id = editId.value;
    const name = nameInput.value.trim();
    const contact = contactInput.value.trim();
    const country = countryInput.value.trim();
    const validationError = validateManufacturerFields(name, contact, country);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        name: name,
        contact_info: contact,
        country: country === '' ? null : country
    };
    let url = MANUFACTURERS_URL, method = 'POST', isUpdate = false;
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
            showToast(msg, 'error');
            return;
        }
        let newId = id;
        if (!id) newId = (await resp.json()).manufacturer_id;
        clearManufacturerForm();
        await loadManufacturersTable();
        const filterSelect = document.getElementById('filter-manufacturer');
        if (filterSelect) await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('product-manufacturer-id');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
        await loadManufacturersForSelect('edit-product-manufacturer-id');
        await loadManufacturersForSelect('edit-ticket-manufacturer-id');
        await loadManufacturersForSelect('edit-clothing-manufacturer-id');
        await loadManufacturersForSelect('edit-accessory-manufacturer-id');
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}
async function deleteManufacturer(id, name) {
    if (!confirm(`Удалить производителя «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${MANUFACTURERS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const error = await resp.json();
            showToast(error.message || 'Невозможно удалить производителя', 'error');
            return;
        }
        clearManufacturerForm();
        await loadManufacturersTable();
        const filterSelect = document.getElementById('filter-manufacturer');
        if (filterSelect) await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('product-manufacturer-id');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
        await loadManufacturersForSelect('edit-product-manufacturer-id');
        await loadManufacturersForSelect('edit-ticket-manufacturer-id');
        await loadManufacturersForSelect('edit-clothing-manufacturer-id');
        await loadManufacturersForSelect('edit-accessory-manufacturer-id');
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}
const manufacturerApplyBtn = document.getElementById('manufacturer-apply-filters');
if (manufacturerApplyBtn) manufacturerApplyBtn.addEventListener('click', () => loadManufacturersTable());
const manufacturerClearBtn = document.getElementById('manufacturer-clear-filters');
if (manufacturerClearBtn) manufacturerClearBtn.addEventListener('click', () => {
    const searchName = document.getElementById('manufacturer-search-name');
    const searchCountry = document.getElementById('manufacturer-search-country');
    const sortBy = document.getElementById('manufacturer-sort');
    if (searchName) searchName.value = '';
    if (searchCountry) searchCountry.value = '';
    if (sortBy) sortBy.value = 'name_asc';
    loadManufacturersTable();
});