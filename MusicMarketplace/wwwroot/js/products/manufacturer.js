let manufacturerEditId = null;

async function loadManufacturersTable() {
    try {
        const resp = await fetch(MANUFACTURERS_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        items.sort((a, b) => a.manufacturer_id - b.manufacturer_id);
        const tbody = document.getElementById('manufacturers-tbody');
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Нет данных';
            return;
        }
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.manufacturer_id;
            row.insertCell(1).textContent = item.name;
            row.insertCell(2).textContent = item.contact_info || '';
            row.insertCell(3).textContent = item.country || '';
            const actions = row.insertCell(4);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.style.marginRight = '5px';
            editBtn.onclick = () => fillManufacturerForm(item);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteManufacturer(item.manufacturer_id, item.name);
            actions.append(editBtn, delBtn);
        });
    } catch (err) {
        document.getElementById('manufacturers-tbody').innerHTML = '</table><td colspan="5">Ошибка загрузки';
    }
}

function fillManufacturerForm(item) {
    document.getElementById('manufacturer-name').value = item.name;
    document.getElementById('manufacturer-contact').value = item.contact_info || '';
    document.getElementById('manufacturer-country').value = item.country || '';
    document.getElementById('manufacturer-edit-id').value = item.manufacturer_id;
    manufacturerEditId = item.manufacturer_id;
    document.getElementById('manufacturer-form-title').innerText = 'Редактировать производителя';
    document.getElementById('manufacturer-submit').innerText = 'Сохранить';
    document.getElementById('manufacturer-cancel').style.display = 'inline-block';
}

function clearManufacturerForm() {
    document.getElementById('manufacturer-name').value = '';
    document.getElementById('manufacturer-contact').value = '';
    document.getElementById('manufacturer-country').value = '';
    document.getElementById('manufacturer-edit-id').value = '';
    manufacturerEditId = null;
    document.getElementById('manufacturer-form-title').innerText = 'Добавить производителя';
    document.getElementById('manufacturer-submit').innerText = 'Добавить';
    document.getElementById('manufacturer-cancel').style.display = 'none';
}

async function saveManufacturer() {
    const id = document.getElementById('manufacturer-edit-id').value;
    const name = document.getElementById('manufacturer-name').value.trim();
    const contact = document.getElementById('manufacturer-contact').value.trim();
    const country = document.getElementById('manufacturer-country').value.trim() || null;

    if (!name) {
        showToast('Название обязательно', 'error');
        return;
    }
    if (!contact) {
        showToast('Контактные данные обязательны', 'error');
        return;
    }

    const data = {
        name: name,
        contact_info: contact,
        country: country
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
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой производитель уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
        let newId = id;
        if (!id) newId = (await resp.json()).manufacturer_id;
        clearManufacturerForm();
        await loadManufacturersTable();
        await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadManufacturersTable();
        await loadManufacturersForSelect('filter-manufacturer');
        await loadManufacturersForSelect('ticket-manufacturer-id');
        await loadManufacturersForSelect('clothing-manufacturer-id');
        await loadManufacturersForSelect('accessory-manufacturer-id');
        await loadManufacturersForSelect('edit-ticket-manufacturer-id');
        await loadManufacturersForSelect('edit-clothing-manufacturer-id');
        await loadManufacturersForSelect('edit-accessory-manufacturer-id');
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}