// Полный обновлённый js/pages/logs.js

(function () {
    let logsData = [];

    function formatJsonPreview(jsonStr, maxLength = 100) {
        if (!jsonStr) return '—';
        if (jsonStr.length <= maxLength) return escapeHtml(jsonStr);
        return escapeHtml(jsonStr.substring(0, maxLength)) + '...';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    async function loadLogs() {
        const tableName = document.getElementById('filter-table')?.value || '';
        const operationType = document.getElementById('filter-operation')?.value || '';
        const sortBy = document.getElementById('sort-by')?.value || 'date_desc';

        let url = `${window.API_URLS.LOGS}?`;
        if (tableName) url += `tableName=${encodeURIComponent(tableName)}&`;
        if (operationType) url += `operationType=${encodeURIComponent(operationType)}&`;
        url += `sortBy=${sortBy}`;

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            logsData = await resp.json();
            renderTable();
        } catch (err) {
            console.error(err);
            const tbody = document.getElementById('logs-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="centered-message">Ошибка загрузки</td></tr>';
            document.getElementById('found-count').innerText = '0';
        }
    }

    function renderTable() {
        const tbody = document.getElementById('logs-tbody');
        const countSpan = document.getElementById('found-count');
        if (!tbody) return;

        if (!logsData || logsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="centered-message">Нет данных</td></tr>';
            if (countSpan) countSpan.innerText = '0';
            return;
        }

        if (countSpan) countSpan.innerText = logsData.length;
        tbody.innerHTML = '';

        logsData.forEach(log => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = log.log_id;
            row.insertCell(1).textContent = log.table_name;
            row.insertCell(2).textContent = log.record_id !== null ? log.record_id : '—';
            row.insertCell(3).textContent = log.operation_type === 'INSERT' ? 'Добавление' : (log.operation_type === 'UPDATE' ? 'Обновление' : 'Удаление');
            row.insertCell(4).textContent = formatJsonPreview(log.old_data, 80);
            row.insertCell(5).textContent = formatJsonPreview(log.new_data, 80);
            row.insertCell(6).textContent = new Date(log.changed_at).toLocaleString();

            const actions = row.insertCell(7);
            const btnRow = document.createElement('div');
            btnRow.className = 'action-buttons-row';
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Детали';
            detailsBtn.className = 'details-btn';
            detailsBtn.onclick = () => showLogDetails(log);
            btnRow.appendChild(detailsBtn);
            actions.appendChild(btnRow);
        });
    }

    function showLogDetails(log) {
        const modal = document.getElementById('log-details-modal');
        const content = document.getElementById('log-details-content');
        if (!modal || !content) return;

        const oldDataPretty = log.old_data ? JSON.stringify(JSON.parse(log.old_data), null, 2) : '—';
        const newDataPretty = log.new_data ? JSON.stringify(JSON.parse(log.new_data), null, 2) : '—';

        content.innerHTML = `
            <p><strong>ID записи лога:</strong> ${log.log_id}</p>
            <p><strong>Таблица:</strong> ${log.table_name}</p>
            <p><strong>ID записи:</strong> ${log.record_id !== null ? log.record_id : '—'}</p>
            <p><strong>Операция:</strong> ${log.operation_type === 'INSERT' ? 'Добавление' : (log.operation_type === 'UPDATE' ? 'Обновление' : 'Удаление')}</p>
            <p><strong>Время:</strong> ${new Date(log.changed_at).toLocaleString()}</p>
            <hr>
            <h4>Данные до изменения:</h4>
            <pre style="background:#f5f5f5;padding:10px;overflow-x:auto;">${escapeHtml(oldDataPretty)}</pre>
            <h4>Данные после изменения:</h4>
            <pre style="background:#f5f5f5;padding:10px;overflow-x:auto;">${escapeHtml(newDataPretty)}</pre>
        `;

        modal.style.display = 'block';
    }

    function closeDetailsModal() {
        const modal = document.getElementById('log-details-modal');
        if (modal) modal.style.display = 'none';
    }

    document.getElementById('apply-filters')?.addEventListener('click', () => loadLogs());
    document.getElementById('clear-filters')?.addEventListener('click', () => {
        document.getElementById('filter-table').value = '';
        document.getElementById('filter-operation').value = '';
        document.getElementById('sort-by').value = 'date_desc';
        loadLogs();
    });
    document.getElementById('log-details-close')?.addEventListener('click', closeDetailsModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('log-details-modal');
        if (e.target === modal) closeDetailsModal();
    });

    document.addEventListener('DOMContentLoaded', () => {
        loadLogs();
    });
})();