let accessoryEditId = null;

function clearAccessoryForm() {
    document.getElementById('accessory-name').value = '';
    document.getElementById('accessory-price').value = '';
    document.getElementById('accessory-description').value = '';
    document.getElementById('accessory-stock').value = '';
    document.getElementById('accessory-manufacturer-id').value = '';
    document.getElementById('accessory-material').value = '';
    document.getElementById('accessory-color').value = '';
    document.getElementById('accessory-type').value = '';
    document.getElementById('accessory-weight').value = '';
    document.getElementById('accessory-edit-id').value = '';
    accessoryEditId = null;
    document.getElementById('accessory-submit').innerText = 'Добавить';
    document.getElementById('accessory-cancel').style.display = 'none';
    document.getElementById('add-accessory-artists-btn').style.display = 'none';
}

function fillEditAccessoryForm(a) {
    hideEditPanel();
    document.getElementById('edit-accessory-id').value = a.accessory_id;
    document.getElementById('edit-accessory-name').value = a.name;
    document.getElementById('edit-accessory-price').value = a.price;
    document.getElementById('edit-accessory-description').value = a.description || '';
    document.getElementById('edit-accessory-stock').value = a.stock;
    document.getElementById('edit-accessory-manufacturer-id').value = a.manufacturer_id || '';
    document.getElementById('edit-accessory-material').value = a.material || '';
    document.getElementById('edit-accessory-color').value = a.color || '';
    document.getElementById('edit-accessory-type').value = a.accessory_type || '';
    document.getElementById('edit-accessory-weight').value = a.weight || '';
    document.getElementById('edit-accessory-form').style.display = 'block';
    const artistsBtn = document.getElementById('edit-accessory-artists-btn');
    if (artistsBtn) artistsBtn.setAttribute('data-product-id', a.accessory_id);
}

function validateAccessoryFields(name, price, manufacturerId, weight, stock) {
    if (!name || name.trim() === '') return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price) || price === '') return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    if (!manufacturerId) return 'Выберите производителя.';
    if (weight !== undefined && weight !== null && weight < 0) return 'Вес не может быть отрицательным.';
    if (stock !== undefined && stock !== null && stock < 0) return 'Остаток не может быть отрицательным.';
    return null;
}

async function saveEditAccessory() {
    const id = document.getElementById('edit-accessory-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-accessory-manufacturer-id').value);
    const name = document.getElementById('edit-accessory-name').value.trim();
    const price = parseFloat(document.getElementById('edit-accessory-price').value);
    const stock = parseInt(document.getElementById('edit-accessory-stock').value) || 0;
    const weight = parseFloat(document.getElementById('edit-accessory-weight').value) || null;
    const validationError = validateAccessoryFields(name, price, manufacturerId, weight, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        accessory_id: parseInt(id),
        name: name,
        price: price,
        description: document.getElementById('edit-accessory-description').value.trim(),
        stock: stock,
        manufacturer_id: manufacturerId,
        material: document.getElementById('edit-accessory-material').value.trim(),
        color: document.getElementById('edit-accessory-color').value.trim(),
        accessory_type: document.getElementById('edit-accessory-type').value.trim(),
        weight: weight
    };
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой аксессуар уже существует', 'error');
            return;
        }
        if (!resp.ok) {
            let errorMsg = 'Ошибка обновления';
            try {
                const text = await resp.text();
                if (text) errorMsg = text;
            } catch (e) { }
            showToast(errorMsg, 'error');
            return;
        }
        await loadAllItems();
        hideEditPanel();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

async function saveAccessory() {
    const name = document.getElementById('accessory-name').value.trim();
    const price = parseFloat(document.getElementById('accessory-price').value);
    const manufacturerId = parseInt(document.getElementById('accessory-manufacturer-id').value);
    const stock = parseInt(document.getElementById('accessory-stock').value) || 0;
    const weight = parseFloat(document.getElementById('accessory-weight').value) || null;
    const validationError = validateAccessoryFields(name, price, manufacturerId, weight, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const id = document.getElementById('accessory-edit-id').value;
    const data = {
        name: name,
        price: price,
        description: document.getElementById('accessory-description').value.trim(),
        stock: stock,
        manufacturer_id: manufacturerId,
        material: document.getElementById('accessory-material').value.trim(),
        color: document.getElementById('accessory-color').value.trim(),
        accessory_type: document.getElementById('accessory-type').value.trim(),
        weight: weight
    };
    let url = ACCESSORIES_URL, method = 'POST';
    if (id) {
        data.accessory_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой аксессуар уже существует', 'error');
            return;
        }
        if (!resp.ok) {
            let errorMsg = 'Ошибка сохранения';
            try {
                const text = await resp.text();
                if (text) errorMsg = text;
            } catch (e) { }
            showToast(errorMsg, 'error');
            return;
        }
        let newId = id;
        if (!id) {
            const result = await resp.json();
            newId = result.accessory_id;
            clearAccessoryForm();
            await loadAllItems();
            showToast(`Запись «${name}» (ID ${newId}) добавлена`, 'success');
            const artistsBtn = document.getElementById('add-accessory-artists-btn');
            if (artistsBtn) {
                artistsBtn.setAttribute('data-product-id', newId);
                artistsBtn.style.display = 'inline-block';
            }
            return;
        }
        clearAccessoryForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteAccessory(id, name) {
    if (!confirm(`Удалить аксессуар «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${ACCESSORIES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}