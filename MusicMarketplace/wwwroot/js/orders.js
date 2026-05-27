const API_URL = 'https://localhost:7062/api/Orders';
const USERS_URL = 'https://localhost:7062/api/Users';
const tbody = document.getElementById('order-tbody');
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const userIdSelect = document.getElementById('user-id');
const orderDateInput = document.getElementById('order-date');
const statusSelect = document.getElementById('status');
const totalAmountInput = document.getElementById('total-amount');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editIdField = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
let currentEditId = null;

function showError(text) {
    errorDiv.textContent = text; errorDiv.classList.add('show'); successDiv.classList.remove('show');
    setTimeout(() => errorDiv.classList.remove('show'), 5000);
}

function showSuccess(text) {
    successDiv.textContent = text; successDiv.classList.add('show'); errorDiv.classList.remove('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
}

function clearForm() {
    userIdSelect.value = ''; orderDateInput.value = ''; statusSelect.value = 'pending'; totalAmountInput.value = '';
    editIdField.value = ''; currentEditId = null;
    formTitle.textContent = 'Добавить заказ'; submitBtn.textContent = 'Добавить'; cancelBtn.style.display = 'none';
}

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
}

function validateForm() {
    const userId = userIdSelect.value;
    const orderDate = orderDateInput.value;
    const totalAmount = parseFloat(totalAmountInput.value);
    if (!userId) { showError('Выберите пользователя'); return false; }
    if (!orderDate) { showError('Дата заказа обязательна'); return false; }
    if (isNaN(totalAmount)) { showError('Сумма должна быть числом'); return false; }
    if (totalAmount <= 0) { showError('Сумма должна быть больше нуля'); return false; }
    if (totalAmount > 100000000) { showError('Сумма не может превышать 100 000 000'); return false; }
    return true;
}

async function loadUsers() {
    const resp = await fetch(USERS_URL);
    if (resp.ok) {
        const users = await resp.json();
        userIdSelect.innerHTML = '<option value="">Выберите пользователя</option>';
        users.forEach(u => { const opt = document.createElement('option'); opt.value = u.user_id; opt.textContent = `${u.full_name} (${u.login})`; userIdSelect.appendChild(opt); });
    }
}

async function renderTable() {
    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        let orders = await resp.json();
        orders.sort((a, b) => a.order_id - b.order_id);
        tbody.innerHTML = '';
        if (orders.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Нет данных</tbody>'; return; }
        for (const order of orders) {
            const userResp = await fetch(`${USERS_URL}/${order.user_id}`);
            const userName = userResp.ok ? (await userResp.json()).full_name : `ID ${order.user_id}`;
            const row = tbody.insertRow();
            row.insertCell(0).textContent = order.order_id;
            row.insertCell(1).textContent = userName;
            row.insertCell(2).textContent = new Date(order.order_date).toLocaleString();
            row.insertCell(3).textContent = order.status;
            row.insertCell(4).textContent = order.total_amount?.toFixed(2);
            const actions = row.insertCell(5);
            const editBtn = document.createElement('button'); editBtn.textContent = 'Ред.'; editBtn.className = 'edit-btn';
            editBtn.onclick = () => fillFormForEdit(order);
            const delBtn = document.createElement('button'); delBtn.textContent = 'Удалить'; delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteOrder(order.order_id);
            actions.append(editBtn, delBtn);
        }
    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</tbody>';
    }
}

function fillFormForEdit(order) {
    userIdSelect.value = order.user_id;
    orderDateInput.value = formatDateTimeLocal(order.order_date);
    statusSelect.value = order.status;
    totalAmountInput.value = order.total_amount;
    editIdField.value = order.order_id;
    currentEditId = order.order_id;
    formTitle.textContent = 'Редактировать заказ';
    submitBtn.textContent = 'Сохранить';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function createOrder() {
    if (!validateForm()) return false;
    const data = { user_id: parseInt(userIdSelect.value), order_date: orderDateInput.value, status: statusSelect.value || 'pending', total_amount: parseFloat(totalAmountInput.value) };
    try {
        const resp = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка добавления';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showError(msg);
            return false;
        }
        clearForm(); await renderTable(); showSuccess('Заказ добавлен'); return true;
    } catch (err) { showError('Ошибка добавления: ' + err.message); return false; }
}

async function updateOrder(id) {
    if (!validateForm()) return false;
    const data = { order_id: id, user_id: parseInt(userIdSelect.value), order_date: orderDateInput.value, status: statusSelect.value || 'pending', total_amount: parseFloat(totalAmountInput.value) };
    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка обновления';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showError(msg);
            return false;
        }
        clearForm(); await renderTable(); showSuccess('Заказ обновлён'); return true;
    } catch (err) { showError('Ошибка обновления: ' + err.message); return false; }
}

async function deleteOrder(id) {
    const confirmed = await showConfirmModal({
        title: 'Удаление заказа',
        message: `Удалить заказ №${id}?`,
        yesText: 'Да, удалить',
        noText: 'Отмена'
    });
    if (!confirmed) return;
    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const error = await resp.json();
            let msg = 'Ошибка удаления';
            if (error.message) msg = error.message;
            else if (error.errors) msg = Object.values(error.errors).flat().join(' ');
            showError(msg);
            return;
        }
        await renderTable();
        showSuccess('Заказ удалён');
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function onSubmit() {
    if (currentEditId !== null) await updateOrder(currentEditId);
    else await createOrder();
}

function onCancel() { clearForm(); }

submitBtn.addEventListener('click', onSubmit);
cancelBtn.addEventListener('click', onCancel);
loadUsers();
renderTable();