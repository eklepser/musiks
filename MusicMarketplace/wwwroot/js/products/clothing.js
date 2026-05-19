let clothingEditId = null;

function clearClothingForm() {
    document.getElementById('clothing-name').value = '';
    document.getElementById('clothing-price').value = '';
    document.getElementById('clothing-description').value = '';
    document.getElementById('clothing-stock').value = '';
    document.getElementById('clothing-manufacturer-id').value = '';
    document.getElementById('clothing-material').value = '';
    document.getElementById('clothing-color').value = '';
    document.getElementById('clothing-size').value = 'M';
    document.getElementById('clothing-gender').value = 'unisex';
    document.getElementById('clothing-edit-id').value = '';
    clothingEditId = null;
    document.getElementById('clothing-submit').innerText = 'Добавить';
    document.getElementById('clothing-cancel').style.display = 'none';
    document.getElementById('add-clothing-artists-btn').style.display = 'none';
}

function fillEditClothingForm(c) {
    hideEditPanel();
    document.getElementById('edit-clothing-id').value = c.clothing_id;
    document.getElementById('edit-clothing-name').value = c.name;
    document.getElementById('edit-clothing-price').value = c.price;
    document.getElementById('edit-clothing-description').value = c.description || '';
    document.getElementById('edit-clothing-stock').value = c.stock;
    document.getElementById('edit-clothing-manufacturer-id').value = c.manufacturer_id || '';
    document.getElementById('edit-clothing-material').value = c.material || '';
    document.getElementById('edit-clothing-color').value = c.color || '';
    document.getElementById('edit-clothing-size').value = c.size || 'M';
    document.getElementById('edit-clothing-gender').value = c.gender || 'unisex';
    document.getElementById('edit-clothing-form').style.display = 'block';
    const artistsBtn = document.getElementById('edit-clothing-artists-btn');
    if (artistsBtn) artistsBtn.setAttribute('data-product-id', c.clothing_id);
}

function validateClothingFields(name, price, manufacturerId, stock) {
    if (!name || name.trim() === '') return 'Название обязательно.';
    if (name.length > 100) return 'Название не может быть длиннее 100 символов.';
    if (isNaN(price) || price === '') return 'Цена должна быть числом.';
    if (price <= 0) return 'Цена должна быть больше нуля.';
    if (price > 1000000) return 'Цена не может превышать 1 000 000 руб.';
    if (!manufacturerId) return 'Выберите производителя.';
    if (stock !== undefined && stock !== null && stock < 0) return 'Остаток не может быть отрицательным.';
    return null;
}

async function saveEditClothing() {
    const id = document.getElementById('edit-clothing-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-clothing-manufacturer-id').value);
    const name = document.getElementById('edit-clothing-name').value.trim();
    const price = parseFloat(document.getElementById('edit-clothing-price').value);
    const stock = parseInt(document.getElementById('edit-clothing-stock').value) || 0;
    const validationError = validateClothingFields(name, price, manufacturerId, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        clothing_id: parseInt(id),
        name: name,
        price: price,
        description: document.getElementById('edit-clothing-description').value.trim(),
        stock: stock,
        manufacturer_id: manufacturerId,
        material: document.getElementById('edit-clothing-material').value.trim(),
        color: document.getElementById('edit-clothing-color').value.trim(),
        size: document.getElementById('edit-clothing-size').value,
        gender: document.getElementById('edit-clothing-gender').value
    };
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
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

async function saveClothing() {
    const name = document.getElementById('clothing-name').value.trim();
    const price = parseFloat(document.getElementById('clothing-price').value);
    const manufacturerId = parseInt(document.getElementById('clothing-manufacturer-id').value);
    const stock = parseInt(document.getElementById('clothing-stock').value) || 0;
    const validationError = validateClothingFields(name, price, manufacturerId, stock);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const id = document.getElementById('clothing-edit-id').value;
    const data = {
        name: name,
        price: price,
        description: document.getElementById('clothing-description').value.trim(),
        stock: stock,
        manufacturer_id: manufacturerId,
        material: document.getElementById('clothing-material').value.trim(),
        color: document.getElementById('clothing-color').value.trim(),
        size: document.getElementById('clothing-size').value,
        gender: document.getElementById('clothing-gender').value
    };
    let url = CLOTHINGS_URL, method = 'POST';
    if (id) {
        data.clothing_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
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
            newId = result.clothing_id;
            clearClothingForm();
            await loadAllItems();
            showToast(`Запись «${name}» (ID ${newId}) добавлена`, 'success');
            const artistsBtn = document.getElementById('add-clothing-artists-btn');
            if (artistsBtn) {
                artistsBtn.setAttribute('data-product-id', newId);
                artistsBtn.style.display = 'inline-block';
            }
            return;
        }
        clearClothingForm();
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${newId}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function deleteClothing(id, name) {
    if (!confirm(`Удалить одежду «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${CLOTHINGS_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}