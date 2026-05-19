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

async function saveEditClothing() {
    const id = document.getElementById('edit-clothing-id').value;
    const manufacturerId = parseInt(document.getElementById('edit-clothing-manufacturer-id').value);
    if (!manufacturerId) {
        showToast('Выберите производителя', 'error');
        return;
    }
    const name = document.getElementById('edit-clothing-name').value.trim();
    const data = {
        clothing_id: parseInt(id),
        name: name,
        price: parseFloat(document.getElementById('edit-clothing-price').value),
        description: document.getElementById('edit-clothing-description').value.trim(),
        stock: parseInt(document.getElementById('edit-clothing-stock').value) || 0,
        manufacturer_id: manufacturerId,
        material: document.getElementById('edit-clothing-material').value.trim(),
        color: document.getElementById('edit-clothing-color').value.trim(),
        size: document.getElementById('edit-clothing-size').value,
        gender: document.getElementById('edit-clothing-gender').value
    };
    if (!data.name || isNaN(data.price)) {
        showToast('Заполните название и цену', 'error');
        return;
    }
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        await loadAllItems();
        showToast(`Запись «${name}» (ID ${id}) обновлена`, 'success');
    } catch (err) {
        showToast('Ошибка обновления', 'error');
    }
}

async function saveClothing() {
    const errorMsg = validateClothing();
    if (errorMsg) { showToast(errorMsg, 'error'); return; }
    const id = document.getElementById('clothing-edit-id').value;
    const name = document.getElementById('clothing-name').value.trim();
    const data = {
        name: name,
        price: parseFloat(document.getElementById('clothing-price').value),
        description: document.getElementById('clothing-description').value.trim(),
        stock: parseInt(document.getElementById('clothing-stock').value) || 0,
        manufacturer_id: parseInt(document.getElementById('clothing-manufacturer-id').value) || null,
        material: document.getElementById('clothing-material').value.trim(),
        color: document.getElementById('clothing-color').value.trim(),
        size: document.getElementById('clothing-size').value,
        gender: document.getElementById('clothing-gender').value
    };
    let url = CLOTHINGS_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.clothing_id = parseInt(id);
        url += `/${id}`;
        method = 'PUT';
        isUpdate = true;
    }
    try {
        const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такая одежда уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
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

function hideReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.style.display = 'none';
    currentProductForReview = null;
}