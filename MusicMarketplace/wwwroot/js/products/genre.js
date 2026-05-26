let genreEditId = null;
async function loadGenresTable() {
    const searchName = document.getElementById('genre-search-name');
    const sortBy = document.getElementById('genre-sort');
    if (!searchName || !sortBy) return;
    const searchNameValue = searchName.value.trim();
    const sortByValue = sortBy.value;
    let url = `https://localhost:7062/api/Genres/filter?`;
    if (searchNameValue) url += `searchName=${encodeURIComponent(searchNameValue)}&`;
    if (sortByValue) url += `sortBy=${sortByValue}&`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        const tbody = document.getElementById('genres-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="centered-message">Нет данных</td></tr>';
            const countSpan = document.getElementById('genre-found-count');
            if (countSpan) countSpan.innerText = '0';
            return;
        }
        const countSpan = document.getElementById('genre-found-count');
        if (countSpan) countSpan.innerText = items.length;
        items.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.genre_id;
            row.insertCell(1).textContent = item.name;
            row.insertCell(2).textContent = item.description || '';
            const actions = row.insertCell(3);
            const btnRow = document.createElement('div');
            btnRow.className = 'action-buttons-row';
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Ред.';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillGenreForm(item);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteGenre(item.genre_id, item.name);
            btnRow.append(editBtn, delBtn);
            actions.appendChild(btnRow);
        });
    } catch (err) {
        const tbody = document.getElementById('genres-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="centered-message">Ошибка загрузки</td></tr>';
        const countSpan = document.getElementById('genre-found-count');
        if (countSpan) countSpan.innerText = '0';
    }
}
function fillGenreForm(item) {
    const nameInput = document.getElementById('genre-name');
    const descInput = document.getElementById('genre-description');
    const editIdInput = document.getElementById('genre-edit-id');
    const formTitle = document.getElementById('genre-form-title');
    const submitBtn = document.getElementById('genre-submit');
    const cancelBtn = document.getElementById('genre-cancel');
    if (!nameInput || !descInput || !editIdInput || !formTitle || !submitBtn || !cancelBtn) return;
    nameInput.value = item.name;
    descInput.value = item.description || '';
    editIdInput.value = item.genre_id;
    genreEditId = item.genre_id;
    formTitle.innerText = 'Редактировать жанр';
    submitBtn.innerText = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function clearGenreForm() {
    const nameInput = document.getElementById('genre-name');
    const descInput = document.getElementById('genre-description');
    const editIdInput = document.getElementById('genre-edit-id');
    const formTitle = document.getElementById('genre-form-title');
    const submitBtn = document.getElementById('genre-submit');
    const cancelBtn = document.getElementById('genre-cancel');
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (editIdInput) editIdInput.value = '';
    genreEditId = null;
    if (formTitle) formTitle.innerText = 'Добавить жанр';
    if (submitBtn) submitBtn.innerText = 'Добавить';
    if (cancelBtn) cancelBtn.style.display = 'none';
}
function validateGenreFields(name, description) {
    let err = validateRequiredString(name, 'Название', 2, 50, true);
    if (err) return err;
    if (description && description.trim() !== '') {
        err = validateOptionalString(description, 'Описание', 500);
        if (err) return err;
    }
    return null;
}
async function saveGenre() {
    const editId = document.getElementById('genre-edit-id');
    const nameInput = document.getElementById('genre-name');
    const descInput = document.getElementById('genre-description');
    if (!editId || !nameInput || !descInput) return;
    const id = editId.value;
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const validationError = validateGenreFields(name, description);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }
    const data = {
        name: name,
        description: description === '' ? null : description
    };
    let url = GENRES_URL, method = 'POST', isUpdate = false;
    if (id) {
        data.genre_id = parseInt(id);
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
        if (!id) newId = (await resp.json()).genre_id;
        clearGenreForm();
        await loadGenresTable();
        await loadGenresAndLinks();
        showToast(`Запись «${name}» (ID ${newId}) ${isUpdate ? 'обновлён' : 'добавлен'}`, 'success');
    } catch (err) {
        showToast('Ошибка сохранения', 'error');
    }
}
async function deleteGenre(id, name) {
    if (!confirm(`Удалить жанр «${name}» (ID ${id})?`)) return;
    try {
        const resp = await fetch(`${GENRES_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const error = await resp.json();
            showToast(error.message || 'Невозможно удалить жанр', 'error');
            return;
        }
        clearGenreForm();
        await loadGenresTable();
        await loadGenresAndLinks();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}
const genreApplyBtn = document.getElementById('genre-apply-filters');
if (genreApplyBtn) genreApplyBtn.addEventListener('click', () => loadGenresTable());
const genreClearBtn = document.getElementById('genre-clear-filters');
if (genreClearBtn) genreClearBtn.addEventListener('click', () => {
    const searchName = document.getElementById('genre-search-name');
    const sortBy = document.getElementById('genre-sort');
    if (searchName) searchName.value = '';
    if (sortBy) sortBy.value = 'name_asc';
    loadGenresTable();
});