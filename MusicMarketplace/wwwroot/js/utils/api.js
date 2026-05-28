window.api = {
    async get(url) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    },
    async post(url, data) {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${resp.status}`);
        }
        return resp.json();
    },
    async put(url, data) {
        const resp = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${resp.status}`);
        }
        return resp;
    },
    async delete(url) {
        const resp = await fetch(url, { method: 'DELETE' });
        if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${resp.status}`);
        }
        return resp;
    }
};