// js/components/productForms.js
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

    function getFormData(type) {
        const getVal = (id) => document.getElementById(`${type}-${id}`)?.value.trim() || '';
        const getNum = (id) => parseFloat(document.getElementById(`${type}-${id}`)?.value) || 0;
        const data = {
            name: getVal('name'),
            price: getNum('price'),
            description: getVal('description') || null,
            stock: parseInt(getVal('stock')) || 0,
            manufacturer_id: parseInt(document.getElementById(`${type}-manufacturer-id`)?.value) || null,
            artistIds: type === 'clothing' ? (window.selectedArtistsForClothing || []) : (type === 'accessory' ? (window.selectedArtistsForAccessory || []) : []),
            genreIds: type === 'ticket' ? (window.selectedGenresForTicket || []) : (type === 'clothing' ? (window.selectedGenresForClothing || []) : (window.selectedGenresForAccessory || []))
        };
        if (type === 'clothing') {
            data.material = getVal('material') || null;
            data.color = getVal('color') || null;
            data.size = document.getElementById(`${type}-size`)?.value || null;
            data.gender = document.getElementById(`${type}-gender`)?.value || null;
        } else if (type === 'accessory') {
            data.material = getVal('material') || null;
            data.color = getVal('color') || null;
            data.accessory_type = getVal('type') || null;
            data.weight = getNum('weight') || null;
        } else if (type === 'ticket') {
            data.concert_id = parseInt(document.getElementById(`${type}-concert-id`)?.value) || null;
            data.price_category = getVal('price-category') || null;
        }
        return data;
    }

    async function save(type) {
        const data = getFormData(type);
        if (!data.manufacturer_id) { window.showToast('Выберите производителя', 'error'); return; }
        if (type === 'ticket' && !data.concert_id) { window.showToast('Выберите концерт', 'error'); return; }
        let url = window.API_URLS[type.toUpperCase() + 'S'];
        let method = 'POST';
        if (editId) {
            data[`${type}_id`] = editId;
            url += `/${editId}`;
            method = 'PUT';
        }
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (resp.status === 409) {
                const error = await resp.json();
                window.showToast(error.message || 'Такой товар уже существует', 'error');
                return;
            }
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            let newId = editId;
            if (!editId) {
                const result = await resp.json();
                newId = result[`${type}_id`];
            }
            window.ProductForms.clearForm(type);
            if (typeof window.Catalog?.render === 'function') await window.Catalog.render();
            window.showToast(`Запись «${data.name}» (ID ${newId}) ${editId ? 'обновлена' : 'добавлена'}`, 'success');
        } catch (err) { window.showToast('Ошибка сохранения', 'error'); }
    }

    function clearForm(type) {
        editId = null;
        document.getElementById(`${type}-edit-id`).value = '';
        const fields = [`${type}-name`, `${type}-price`, `${type}-description`, `${type}-stock`, `${type}-manufacturer-id`];
        if (type === 'clothing') fields.push(`${type}-material`, `${type}-color`, `${type}-size`, `${type}-gender`);
        if (type === 'accessory') fields.push(`${type}-material`, `${type}-color`, `${type}-type`, `${type}-weight`);
        if (type === 'ticket') fields.push(`${type}-concert-id`, `${type}-price-category`);
        fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
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
        editId = item[`${type}_id`];
        document.getElementById(`${type}-edit-id`).value = editId;
        document.getElementById(`${type}-name`).value = item.name;
        document.getElementById(`${type}-price`).value = item.price;
        document.getElementById(`${type}-description`).value = item.description || '';
        document.getElementById(`${type}-stock`).value = item.stock;
        document.getElementById(`${type}-manufacturer-id`).value = item.manufacturer_id || '';
        if (type === 'clothing') {
            document.getElementById(`${type}-material`).value = item.material || '';
            document.getElementById(`${type}-color`).value = item.color || '';
            document.getElementById(`${type}-size`).value = item.size || 'M';
            document.getElementById(`${type}-gender`).value = item.gender || 'unisex';
            if (window.selectedArtistsForClothing) window.selectedArtistsForClothing = window.ensureArray ? window.ensureArray(item.artistIds) : (Array.isArray(item.artistIds) ? item.artistIds : []);
            if (window.selectedGenresForClothing) window.selectedGenresForClothing = item.genreIds || [];
            if (typeof window.renderEditClothingSelectedArtists === 'function') window.renderEditClothingSelectedArtists();
            if (typeof window.renderEditClothingSelectedGenres === 'function') window.renderEditClothingSelectedGenres();
        } else if (type === 'accessory') {
            document.getElementById(`${type}-material`).value = item.material || '';
            document.getElementById(`${type}-color`).value = item.color || '';
            document.getElementById(`${type}-type`).value = item.accessory_type || '';
            document.getElementById(`${type}-weight`).value = item.weight || '';
            if (window.selectedArtistsForAccessory) window.selectedArtistsForAccessory = window.ensureArray ? window.ensureArray(item.artistIds) : (Array.isArray(item.artistIds) ? item.artistIds : []);
            if (window.selectedGenresForAccessory) window.selectedGenresForAccessory = item.genreIds || [];
            if (typeof window.renderEditAccessorySelectedArtists === 'function') window.renderEditAccessorySelectedArtists();
            if (typeof window.renderEditAccessorySelectedGenres === 'function') window.renderEditAccessorySelectedGenres();
        } else if (type === 'ticket') {
            document.getElementById(`${type}-concert-id`).value = item.concert_id || '';
            document.getElementById(`${type}-price-category`).value = item.price_category || '';
            if (window.selectedGenresForTicket) window.selectedGenresForTicket = item.genreIds || [];
            if (typeof window.renderEditTicketSelectedGenres === 'function') window.renderEditTicketSelectedGenres();
        }
        document.getElementById('edit-ticket-form').style.display = 'none';
        document.getElementById('edit-clothing-form').style.display = 'none';
        document.getElementById('edit-accessory-form').style.display = 'none';
        document.getElementById(`edit-${type}-form`).style.display = 'block';
        document.getElementById('edit-panel').style.display = 'block';
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
            const url = window.API_URLS[type.toUpperCase() + 'S'];
            const resp = await fetch(`${url}/${id}`, { method: 'DELETE' });
            if (resp.status === 409) {
                const error = await resp.json();
                window.showToast(error.message || 'Невозможно удалить товар, который есть в заказах', 'error');
                return;
            }
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            if (typeof window.hideEditPanel === 'function') window.hideEditPanel();
            if (typeof window.Catalog?.render === 'function') await window.Catalog.render();
            window.showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
        } catch (err) { window.showToast('Ошибка удаления', 'error'); }
    }

    return { save, clearForm, fillEditForm, deleteItem, resetState };
})();