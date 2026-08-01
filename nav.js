// Renders the top bar and mobile bottom nav into #nav-placeholder.
// "active" should be one of: dashboard, customers

function renderNav(active) {
  const user = getUser();
  const el = document.getElementById('nav-placeholder');
  if (!el) return;

  const isActive = (name) => (active === name ? 'active' : '');

  el.innerHTML = `
    <div class="topbar">
      <div class="brand"><span class="dot">📍</span> FieldTrack CRM</div>
      <nav>
        <a href="/dashboard.html" class="${isActive('dashboard')}">Dashboard</a>
        <a href="/customers.html" class="${isActive('customers')}">Customers</a>
      </nav>
      <button class="logout-btn" onclick="logout()">Log out</button>
    </div>
    <div class="bottom-nav">
      <a href="/dashboard.html" class="${isActive('dashboard')}">
        <span class="icon">🏠</span>Dashboard
      </a>
      <a href="/customers.html" class="${isActive('customers')}">
        <span class="icon">👥</span>Customers
      </a>
      <a href="/customers-new.html" class="">
        <span class="icon">➕</span>Add
      </a>
    </div>
  `;
}
