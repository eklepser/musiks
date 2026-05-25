let genreEditId = null;

async function loadGenresTable() {
    const searchName = document.getElementById('genre-search-name').value.trim();
    const sortBy = document.getElementById('genre-sort').value;

    let url = `https://localhost:7062/api/Genres/filter?`;
    if (searchName) url += `searchName=${encodeURIComponent(searchName)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let items = await resp.json();
        const tbody = document.getElementById('genres-tbody');
        tbody.innerHTML = '';
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="centered-message">Нет данных</tr>';
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
        document.getElementById('genres-tbody').innerHTML = '<tr><td colspan="4" class="centered-message">Ошибка загрузки</tr>';
        document.getElementById('genre-found-count').innerText = '0';
    }
}

function fillGenreForm(item) {
    document.getElementById('genre-name').value = item.name;
    document.getElementById('genre-description').value = item.description || '';
    document.getElementById('genre-edit-id').value = item.genre_id;
    genreEditId = item.genre_id;
    document.getElementById('genre-form-title').innerText = 'Редактировать жанр';
    document.getElementById('genre-submit').innerText = 'Сохранить';
    document.getElementById('genre-cancel').style.display = 'inline-block';
}

function clearGenreForm() {
    document.getElementById('genre-name').value = '';
    document.getElementById('genre-description').value = '';
    document.getElementById('genre-edit-id').value = '';
    genreEditId = null;
    document.getElementById('genre-form-title').innerText = 'Добавить жанр';
    document.getElementById('genre-submit').innerText = 'Добавить';
    document.getElementById('genre-cancel').style.display = 'none';
}

async function saveGenre() {
    const id = document.getElementById('genre-edit-id').value;
    const name = document.getElementById('genre-name').value.trim();
    const description = document.getElementById('genre-description').value.trim();

    if (!name) {
        showToast('Название обязательно', 'error');
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
        if (resp.status === 409) {
            const text = await resp.text();
            showToast(text.includes('already') ? text : 'Такой жанр уже существует', 'error');
            return;
        }
        if (!resp.ok) throw new Error('Ошибка ' + resp.status);
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
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        clearGenreForm();
        await loadGenresTable();
        await loadGenresAndLinks();
        showToast(`Запись «${name}» (ID ${id}) удалена`, 'success');
    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

document.getElementById('genre-apply-filters').addEventListener('click', () => loadGenresTable());
document.getElementById('genre-clear-filters').addEventListener('click', () => {
    document.getElementById('genre-search-name').value = '';
    document.getElementById('genre-sort').value = 'name_asc';
    loadGenresTable();
});