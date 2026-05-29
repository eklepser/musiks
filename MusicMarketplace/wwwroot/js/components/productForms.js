window.ProductForms = (function () {
    let editId = null;
    function resetState() {
        editId = null;
        if (window.selectedArtistsForClothing) window.selectedArtistsForClothing = [];
        if (window.selectedArtistsForAccessory) window.selectedArtistsForAccessory = [];
        if (window.selectedGenresForTicket) window.selectedGenresForTicket = [];
        if (window.selectedGenresForClothing) window.selectedGenresForClothing = [];
        if (window.selectedGenresForAccessory) window.selectedGenresForAccessory = [];
    }
    function getApiUrl(type) {
        switch (type) {
            case 'ticket': return window.API_URLS.TICKETS;
            case 'clothing': return window.API_URLS.CLOTHINGS;
            case 'accessory': return window.API_URLS.ACCESSORIES;
            default: return '';
        }
    }
    function getFormData(type, isEdit = false) {
        const prefix = isEdit ? 'edit-' : '';
        const getVal = (id) => document.getElementById(`${prefix}${type}-${id}`)?.value.trim() || '';
        const getNum = (id) => parseFloat(document.getElementById(`${prefix}${type}-${id}`)?.value) || 0;
        const data = {
            name: getVal('name'),
            price: getNum('price'),
            description: getVal('description') || null,
            stock: parseInt(getVal('stock')) || 0,
            manufacturer_id: parseInt(document.getElementById(`${prefix}${type}-manufacturer-id`)?.value) || null,
            artistIds: type === 'clothing' ? (window.selectedArtistsForClothing || []) : (type === 'accessory' ? (window.selectedArtistsForAccessory || []) : []),
            genreIds: type === 'ticket' ? (window.selectedGenresForTicket || []) : (type === 'clothing' ? (window.selectedGenresForClothing || []) : (window.selectedGenresForAccessory || []))
        };
        if (type === 'clothing') {
            data.material = getVal('material') || null;
            data.color = getVal('color') || null;
            data.size = document.getElementById(`${prefix}${type}-size`)?.value || null;
            data.gender = document.getElementById(`${prefix}${type}-gender`)?.value || null;
        } else if (type === 'accessory') {
            data.material = getVal('material') || null;
            data.color = getVal('color') || null;
            data.accessory_type = getVal('type') || null;
            data.weight = getNum('weight') || null;
        } else if (type === 'ticket') {
            data.concert_id = parseInt(document.getElementById(`${prefix}${type}-concert-id`)?.value) || null;
            data.price_category = getVal('price-category') || null;
        }
        return data;
    }
    function triggerFieldValidation(element) {
        if (!element) return;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    function clearFieldValidation(element) {
        if (!element) return;
        element.classList.remove('is-valid', 'is-invalid');
        element.setCustomValidity('');
    }
    function clearAllFieldsValidation(prefix, type) {
        const fields = ['name', 'price', 'stock', 'manufacturer-id', 'description'];
        if (type === 'ticket') fields.push('concert-id', 'price-category');
        if (type === 'clothing') fields.push('material', 'color', 'size', 'gender');
        if (type === 'accessory') fields.push('material', 'color', 'type', 'weight');
        fields.forEach(field => {
            const el = document.getElementById(`${prefix}${type}-${field}`);
            if (el) clearFieldValidation(el);
        });
    }
    function triggerAllFieldsValidation(prefix, type) {
        const fields = ['name', 'price', 'stock', 'manufacturer-id', 'description'];
        if (type === 'ticket') fields.push('concert-id', 'price-category');
        if (type === 'clothing') fields.push('material', 'color', 'size', 'gender');
        if (type === 'accessory') fields.push('material', 'color', 'type', 'weight');
        fields.forEach(field => {
            const el = document.getElementById(`${prefix}${type}-${field}`);
            if (el) triggerFieldValidation(el);
        });
    }
    function validateTicketData(data) {
        let err = window.validateRequiredString(data.name, 'Название', 2, 200, true);
        if (err) return err;
        err = window.validatePrice(data.price, true);
        if (err) return err;
        err = window.validateStock(data.stock, false);
        if (err) return err;
        if (data.description) {
            err = window.validateNoLeadingDigit(data.description, 'Описание', false, 10, 1000);
            if (err) return err;
        }
        if (data.price_category) {
            err = window.validateAlphabeticWithSpaces(data.price_category, 'Тип места', 3, 30, false);
            if (err) return err;
        }
        if (!data.manufacturer_id) return 'Выберите производителя';
        if (!data.concert_id) return 'Выберите концерт';
        return null;
    }
    function validateClothingData(data) {
        let err = window.validateRequiredString(data.name, 'Название', 2, 200, true);
        if (err) return err;
        err = window.validatePrice(data.price, true);
        if (err) return err;
        err = window.validateStock(data.stock, false);
        if (err) return err;
        if (data.description) {
            err = window.validateNoLeadingDigit(data.description, 'Описание', false, 10, 1000);
            if (err) return err;
        }
        if (data.material) {
            err = window.validateNoLeadingDigit(data.material, 'Материал', false, 2, 50);
            if (err) return err;
        }
        if (data.color) {
            err = window.validateAlphabeticWithSpaces(data.color, 'Цвет', 3, 30, false);
            if (err) return err;
        }
        if (!data.manufacturer_id) return 'Выберите производителя';
        return null;
    }
    function validateAccessoryData(data) {
        let err = window.validateRequiredString(data.name, 'Название', 2, 200, true);
        if (err) return err;
        err = window.validatePrice(data.price, true);
        if (err) return err;
        err = window.validateStock(data.stock, false);
        if (err) return err;
        if (data.description) {
            err = window.validateNoLeadingDigit(data.description, 'Описание', false, 10, 1000);
            if (err) return err;
        }
        if (data.material) {
            err = window.validateNoLeadingDigit(data.material, 'Материал', false, 2, 50);
            if (err) return err;
        }
        if (data.color) {
            err = window.validateAlphabeticWithSpaces(data.color, 'Цвет', 3, 30, false);
            if (err) return err;
        }
        if (data.accessory_type) {
            err = window.validateAlphabeticWithSpaces(data.accessory_type, 'Тип аксессуара', 3, 50, false);
            if (err) return err;
        }
        if (!data.manufacturer_id) return 'Выберите производителя';
        return null;
    }
    async function save(type) {
        const isEdit = editId !== null;
        const data = getFormData(type, isEdit);
        let validationError = null;
        if (type === 'ticket') validationError = validateTicketData(data);
        else if (type === 'clothing') validationError = validateClothingData(data);
        else if (type === 'accessory') validationError = validateAccessoryData(data);
        if (validationError) {
            window.showToast(validationError, 'error');
            return;
        }
        let url = getApiUrl(type);
        let method = 'POST';
        if (isEdit) {
            data[`${type}_id`] = editId;
            url += `/${editId}`;
            method = 'PUT';
        }
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (resp.status === 409) {
                const error = await resp.json().catch(() => ({}));
                window.showToast(error.message || 'Такой товар уже существует', 'error');
                return;
            }
            if (!resp.ok) {
                const errorMsg = await window.parseErrorMessage(resp);
                window.showToast(errorMsg, 'error');
                return;
            }
            let newId = editId;
            if (!isEdit) {
                const result = await resp.json();
                newId = result[`${type}_id`];
            }
            clearAllFieldsValidation(isEdit ? 'edit-' : '', type);
            if (isEdit) {
                const editFields = ['name', 'price', 'description', 'stock', 'manufacturer-id'];
                if (type === 'ticket') editFields.push('concert-id', 'price-category');
                if (type === 'clothing') editFields.push('material', 'color', 'size', 'gender');
                if (type === 'accessory') editFields.push('material', 'color', 'type', 'weight');
                editFields.forEach(f => { const el = document.getElementById(`edit-${type}-${f}`); if (el) el.value = ''; });
                document.getElementById('edit-panel').style.display = 'none';
                document.getElementById(`edit-${type}-form`).style.display = 'none';
                editId = null;
            } else {
                clearForm(type);
            }
            if (typeof window.Catalog?.render === 'function') await window.Catalog.render();
            window.showToast(`Запись «${data.name}» (ID ${newId}) ${isEdit ? 'обновлена' : 'добавлена'}`, 'success');
        } catch (err) {
            console.error(err);
            window.showToast('Ошибка сохранения', 'error');
        }
    }
    function clearForm(type) {
        editId = null;
        const addIdEl = document.getElementById(`${type}-edit-id`);
        if (addIdEl) addIdEl.value = '';
        const fields = [`${type}-name`, `${type}-price`, `${type}-description`, `${type}-stock`, `${type}-manufacturer-id`];
        if (type === 'clothing') fields.push(`${type}-material`, `${type}-color`, `${type}-size`, `${type}-gender`);
        if (type === 'accessory') fields.push(`${type}-material`, `${type}-color`, `${type}-type`, `${type}-weight`);
        if (type === 'ticket') fields.push(`${type}-concert-id`, `${type}-price-category`);
        fields.forEach(id => { const el = document.getElementById(id); if (el) { el.value = ''; clearFieldValidation(el); } });
        if (type === 'clothing') { if (window.selectedArtistsForClothing) window.selectedArtistsForClothing = []; if (window.selectedGenresForClothing) window.selectedGenresForClothing = []; }
        if (type === 'accessory') { if (window.selectedArtistsForAccessory) window.selectedArtistsForAccessory = []; if (window.selectedGenresForAccessory) window.selectedGenresForAccessory = []; }
        if (type === 'ticket' && window.selectedGenresForTicket) window.selectedGenresForTicket = [];
        if (type === 'clothing') { if (typeof window.renderClothingSelectedArtists === 'function') window.renderClothingSelectedArtists(); if (typeof window.renderClothingSelectedGenres === 'function') window.renderClothingSelectedGenres(); }
        if (type === 'accessory') { if (typeof window.renderAccessorySelectedArtists === 'function') window.renderAccessorySelectedArtists(); if (typeof window.renderAccessorySelectedGenres === 'function') window.renderAccessorySelectedGenres(); }
        if (type === 'ticket' && typeof window.renderTicketSelectedGenres === 'function') window.renderTicketSelectedGenres();
        document.getElementById(`${type}-submit`).innerText = 'Добавить';
        document.getElementById(`${type}-cancel`).style.display = 'none';
    }
    function fillEditForm(item, type) {
        clearForm(type);
        editId = item.product_id || item.id || item[`${type}_id`];
        document.getElementById(`edit-${type}-id`).value = editId;
        document.getElementById(`edit-${type}-name`).value = item.name;
        document.getElementById(`edit-${type}-price`).value = item.price;
        document.getElementById(`edit-${type}-description`).value = item.description || '';
        document.getElementById(`edit-${type}-stock`).value = item.stock;
        document.getElementById(`edit-${type}-manufacturer-id`).value = item.manufacturer_id || '';
        if (type === 'clothing') {
            document.getElementById(`edit-${type}-material`).value = item.material || '';
            document.getElementById(`edit-${type}-color`).value = item.color || '';
            document.getElementById(`edit-${type}-size`).value = item.size || 'M';
            document.getElementById(`edit-${type}-gender`).value = item.gender || 'unisex';
            if (window.selectedArtistsForClothing) window.selectedArtistsForClothing = window.ensureArray ? window.ensureArray(item.artistIds) : (Array.isArray(item.artistIds) ? item.artistIds : []);
            if (window.selectedGenresForClothing) window.selectedGenresForClothing = item.genreIds || [];
            if (typeof window.renderEditClothingSelectedArtists === 'function') window.renderEditClothingSelectedArtists();
            if (typeof window.renderEditClothingSelectedGenres === 'function') window.renderEditClothingSelectedGenres();
        } else if (type === 'accessory') {
            document.getElementById(`edit-${type}-material`).value = item.material || '';
            document.getElementById(`edit-${type}-color`).value = item.color || '';
            document.getElementById(`edit-${type}-type`).value = item.accessory_type || '';
            document.getElementById(`edit-${type}-weight`).value = item.weight || '';
            if (window.selectedArtistsForAccessory) window.selectedArtistsForAccessory = window.ensureArray ? window.ensureArray(item.artistIds) : (Array.isArray(item.artistIds) ? item.artistIds : []);
            if (window.selectedGenresForAccessory) window.selectedGenresForAccessory = item.genreIds || [];
            if (typeof window.renderEditAccessorySelectedArtists === 'function') window.renderEditAccessorySelectedArtists();
            if (typeof window.renderEditAccessorySelectedGenres === 'function') window.renderEditAccessorySelectedGenres();
        } else if (type === 'ticket') {
            document.getElementById(`edit-${type}-concert-id`).value = item.concert_id || '';
            document.getElementById(`edit-${type}-price-category`).value = item.price_category || '';
            if (window.selectedGenresForTicket) window.selectedGenresForTicket = item.genreIds || [];
            if (typeof window.renderEditTicketSelectedGenres === 'function') window.renderEditTicketSelectedGenres();
        }
        document.getElementById('edit-ticket-form').style.display = 'none';
        document.getElementById('edit-clothing-form').style.display = 'none';
        document.getElementById('edit-accessory-form').style.display = 'none';
        document.getElementById(`edit-${type}-form`).style.display = 'block';
        document.getElementById('edit-panel').style.display = 'block';
        triggerAllFieldsValidation('edit-', type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    async function deleteItem(id, name, type) {
        const confirmed = await window.showConfirmModal({
            title: `Удаление ${type === 'clothing' ? 'одежды' : type === 'accessory' ? 'аксессуара' : 'билета'}`,
            message: `Удалить «${name}» (ID ${id})?`,
            yesText: 'Да, удалить',
            noText: 'Отмена'
        });
        if (!confirmed) return;
        try {
            const url = getApiUrl(type);
            const resp = await fetch(`${url}/${id}`, { method: 'DELETE' });
            if (!resp.ok) {
                const errorMsg = await window.parseErrorMessage(resp);
                window.showToast(errorMsg, 'error');
                return;
            }
            if (typeof window.hideEditPanel === 'function') window.hideEditPanel();
            if (typeof window.Catalog?.render === 'function') await window.Catalog.render();
            window.showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
        } catch (err) {
            window.showToast('Ошибка сети', 'error');
        }
    }
    return { save, clearForm, fillEditForm, deleteItem, resetState };
})();