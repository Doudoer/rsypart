// Global state
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// API Base URL
const API_URL = '/api';

// Utility functions
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
    }).format(amount);
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        token = data.token;
        user = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        initDashboard();
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    token = null;
    user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showPage('login-page');
});

// Initialize dashboard
function initDashboard() {
    showPage('dashboard-page');
    document.getElementById('user-display').textContent = `${user.username} (${user.role})`;

    // Show/hide elements based on role
    document.querySelectorAll('.vendedor-only').forEach(el => {
        el.style.display = ['vendedor', 'admin'].includes(user.role) ? '' : 'none';
    });

    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = user.role === 'admin' ? '' : 'none';
    });

    loadSales();
    loadClaims();
    if (user.role === 'admin') {
        loadUsers();
    }
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        showSection(section);
    });
});

// Sales Management
async function loadSales() {
    const showArchived = document.getElementById('show-archived').checked;
    try {
        const sales = await apiRequest(`/sales?includeArchived=${showArchived}`);
        renderSalesTable(sales);
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function renderSalesTable(sales) {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';

    sales.forEach(sale => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.client_nombre}</td>
            <td>${sale.client_telefono}</td>
            <td>${sale.parte}</td>
            <td>${formatCurrency(sale.precio)}</td>
            <td>${formatDate(sale.fecha)}</td>
            <td>
                ${['dueño', 'admin'].includes(user.role) ? 
                    `<select class="status-select" data-sale-id="${sale.id}">
                        <option value="buscando" ${sale.estatus === 'buscando' ? 'selected' : ''}>Buscando</option>
                        <option value="listo" ${sale.estatus === 'listo' ? 'selected' : ''}>Listo</option>
                        <option value="entregado" ${sale.estatus === 'entregado' ? 'selected' : ''}>Entregado</option>
                        <option value="reembolsado" ${sale.estatus === 'reembolsado' ? 'selected' : ''}>Reembolsado</option>
                    </select>` :
                    `<span class="status-badge status-${sale.estatus}">${sale.estatus}</span>`
                }
            </td>
            <td>
                <div class="action-buttons">
                    ${user.role === 'admin' ? 
                        `<button class="btn-danger" onclick="deleteSale(${sale.id})">Eliminar</button>` : 
                        ''
                    }
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners to status selects
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const saleId = e.target.getAttribute('data-sale-id');
            const newStatus = e.target.value;
            await updateSaleStatus(saleId, newStatus);
        });
    });
}

async function updateSaleStatus(saleId, estatus) {
    try {
        await apiRequest(`/sales/${saleId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estatus })
        });
        loadSales();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

async function deleteSale(saleId) {
    if (!confirm('¿Está seguro de eliminar esta venta?')) return;

    try {
        await apiRequest(`/sales/${saleId}`, { method: 'DELETE' });
        loadSales();
    } catch (error) {
        alert('Error deleting sale: ' + error.message);
    }
}

// Show archived checkbox
document.getElementById('show-archived').addEventListener('change', loadSales);

// New sale form
document.getElementById('new-sale-btn').addEventListener('click', () => {
    document.getElementById('new-sale-form').style.display = 'block';
    document.getElementById('fecha').valueAsDate = new Date();
});

document.getElementById('cancel-sale-btn').addEventListener('click', () => {
    document.getElementById('new-sale-form').style.display = 'none';
    document.getElementById('sale-form').reset();
});

document.getElementById('sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('sale-error');

    const saleData = {
        client_nombre: document.getElementById('client-nombre').value,
        client_telefono: document.getElementById('client-telefono').value,
        parte: document.getElementById('parte').value,
        precio: parseFloat(document.getElementById('precio').value),
        fecha: document.getElementById('fecha').value,
        year: document.getElementById('year').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value
    };

    try {
        await apiRequest('/sales', {
            method: 'POST',
            body: JSON.stringify(saleData)
        });

        document.getElementById('new-sale-form').style.display = 'none';
        document.getElementById('sale-form').reset();
        errorDiv.textContent = '';
        loadSales();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Claims Management
async function loadClaims() {
    try {
        const claims = await apiRequest('/claims');
        renderClaimsTable(claims);
    } catch (error) {
        console.error('Error loading claims:', error);
    }
}

function renderClaimsTable(claims) {
    const tbody = document.querySelector('#claims-table tbody');
    tbody.innerHTML = '';

    claims.forEach(claim => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${claim.id}</td>
            <td>${claim.sale_id}</td>
            <td>${claim.client_nombre}</td>
            <td>${claim.parte}</td>
            <td>${claim.tipo}</td>
            <td>
                <select class="status-select" data-claim-id="${claim.id}">
                    <option value="pendiente" ${claim.estatus === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="resuelto" ${claim.estatus === 'resuelto' ? 'selected' : ''}>Resuelto</option>
                    <option value="rechazado" ${claim.estatus === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                </select>
            </td>
            <td>${formatDate(claim.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-danger" onclick="deleteClaim(${claim.id})">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners to status selects
    document.querySelectorAll('#claims-table .status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const claimId = e.target.getAttribute('data-claim-id');
            const newStatus = e.target.value;
            await updateClaimStatus(claimId, newStatus);
        });
    });
}

async function updateClaimStatus(claimId, estatus) {
    try {
        await apiRequest(`/claims/${claimId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estatus })
        });
        loadClaims();
        loadSales(); // Refresh sales in case status changed due to refund
    } catch (error) {
        alert('Error updating claim status: ' + error.message);
    }
}

async function deleteClaim(claimId) {
    if (!confirm('¿Está seguro de eliminar este reclamo?')) return;

    try {
        await apiRequest(`/claims/${claimId}`, { method: 'DELETE' });
        loadClaims();
    } catch (error) {
        alert('Error deleting claim: ' + error.message);
    }
}

// New claim form
document.getElementById('new-claim-btn').addEventListener('click', () => {
    document.getElementById('new-claim-form').style.display = 'block';
});

document.getElementById('cancel-claim-btn').addEventListener('click', () => {
    document.getElementById('new-claim-form').style.display = 'none';
    document.getElementById('claim-form').reset();
});

document.getElementById('claim-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('claim-error');

    const claimData = {
        sale_id: parseInt(document.getElementById('claim-sale-id').value),
        tipo: document.getElementById('claim-tipo').value,
        descripcion: document.getElementById('claim-descripcion').value
    };

    try {
        await apiRequest('/claims', {
            method: 'POST',
            body: JSON.stringify(claimData)
        });

        document.getElementById('new-claim-form').style.display = 'none';
        document.getElementById('claim-form').reset();
        errorDiv.textContent = '';
        loadClaims();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Users Management (Admin only)
async function loadUsers() {
    try {
        const users = await apiRequest('/users');
        renderUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    users.forEach(userItem => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${userItem.id}</td>
            <td>${userItem.username}</td>
            <td>${userItem.role}</td>
            <td>${formatDate(userItem.created_at)}</td>
            <td>
                <div class="action-buttons">
                    ${userItem.id !== 1 ? 
                        `<button class="btn-danger" onclick="deleteUser(${userItem.id})">Eliminar</button>` : 
                        '<span>-</span>'
                    }
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
        await apiRequest(`/users/${userId}`, { method: 'DELETE' });
        loadUsers();
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

// New user form
document.getElementById('new-user-btn').addEventListener('click', () => {
    document.getElementById('new-user-form').style.display = 'block';
});

document.getElementById('cancel-user-btn').addEventListener('click', () => {
    document.getElementById('new-user-form').style.display = 'none';
    document.getElementById('user-form').reset();
});

document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('user-error');

    const userData = {
        username: document.getElementById('user-username').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value
    };

    try {
        await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        document.getElementById('new-user-form').style.display = 'none';
        document.getElementById('user-form').reset();
        errorDiv.textContent = '';
        loadUsers();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Initialize
if (token && user) {
    initDashboard();
} else {
    showPage('login-page');
}
