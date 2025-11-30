import { isAuthenticated, logout, getUserClaims } from '../services/auth.services';
import { isAdmin } from '../utils/permissions';

function buildAuthLinks() {
  if (isAuthenticated()) {
    const claims = getUserClaims();
    const display = claims?.username || claims?.email || 'Usuário';
    const showAdmin = isAdmin();
    return `
      <li class="nav-item"><a class="nav-link" href="/src/pages/dashboard.html">Painel</a></li>
      <li class="nav-item"><a class="nav-link" href="/src/pages/submissao.html">Nova Doação</a></li>
      <li class="nav-item"><a class="nav-link" href="/src/pages/historico.html">Histórico</a></li>
      ${showAdmin ? '<li class="nav-item"><a class="nav-link" href="/src/pages/admin.html">Admin</a></li>' : ''}
      <li class="nav-item"><a class="nav-link" href="/src/pages/galeria.html">Badges</a></li>
      <li class="nav-item">
        <a class="nav-link" id="perfil-link" href="/src/pages/perfil.html">
          Perfil (<span id="navUserDisplay">${display}</span>)
        </a>
      </li>
      <li class="nav-item"><a class="nav-link text-danger" href="#" id="logout-link">Sair</a></li>
    `;
  }
  return `
    <li class="nav-item"><a class="nav-link" href="/src/pages/login.html">Entrar</a></li>
    <li class="nav-item"><a class="nav-link" href="/src/pages/cadastro.html">Cadastro</a></li>
  `;
}

export function injectNavbar() {
  // força reconstrução sempre que chamado
  const prev = document.getElementById('ecodoacao-navbar');
  if (prev) prev.remove();

  const nav = document.createElement('nav');
  nav.id = 'ecodoacao-navbar';
  nav.className = 'navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top';
  nav.innerHTML = `
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="/">
        <img src="/src/assets/img/logo-eco-doacao.png" alt="Eco Doação" style="height:34px;" />
        <span class="fw-bold text-success">Eco Doação</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#ecodoacaoNavMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="ecodoacaoNavMenu">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          ${buildAuthLinks()}
        </ul>
      </div>
    </div>
  `;
  document.body.prepend(nav);
  markActiveLink();

  const logoutLink = nav.querySelector('#logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', e => {
      e.preventDefault();
      logout();
      window.location.href = '/';
    });
  }
}

export function setNavbarUser(name: string): void {
  try {
    let el = document.getElementById('navUserDisplay');
    if (!el) {
      const candidate =
        document.querySelector('#userName, .nav-username, .navbar-username, .navbar-user, [data-user-name]') as HTMLElement | null;
      if (candidate) {
        if (!candidate.id) candidate.id = 'navUserDisplay';
        el = candidate;
      }
    }
    if (el) el.textContent = name;
  } catch {
  }
}

function markActiveLink() {
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('#ecodoacao-navbar .nav-link').forEach(a => {
    const target = a.getAttribute('href')?.split('/').pop();
    if (target && target === current) a.classList.add('active');
  });
}