// Navbar Injection Service
export function injectNavbar() {
  // Check if navbar already exists
  if (document.getElementById('ecodoacao-navbar')) return;
  
  // Wait for body to be ready
  if (!document.body) {
    setTimeout(() => injectNavbar(), 100);
    return;
  }

  const nav = document.createElement('nav');
  nav.id = 'ecodoacao-navbar';
  nav.className = 'navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top';
  nav.setAttribute('role', 'navigation');
  
  nav.innerHTML = `
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="/">
        <img src="/src/assets/img/logo-eco-doacao.png" alt="Eco Doação logo" style="height:34px;" />
        <span class="fw-bold text-success">Eco Doação</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#ecodoacaoNavMenu" aria-controls="ecodoacaoNavMenu" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="ecodoacaoNavMenu">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="/">Entrar</a></li>
          <li class="nav-item"><a class="nav-link" href="/src/pages/cadastro.html">Cadastro</a></li>
          <li class="nav-item"><a class="nav-link" href="/src/pages/dashboard.html">Painel</a></li>
          <li class="nav-item"><a class="nav-link" href="/src/pages/submissao.html">Nova Doação</a></li>
          <li class="nav-item"><a class="nav-link" href="/src/pages/historico.html">Histórico</a></li>
          <li class="nav-item"><a class="nav-link" href="/src/pages/admin.html">Admin</a></li>
        </ul>
      </div>
    </div>
  `;
  
  document.body.insertBefore(nav, document.body.firstChild);
  
  // Mark active link based on current pathname
  markActiveLink();
}

function markActiveLink() {
  const currentPath = globalThis.location.pathname;
  const links = document.querySelectorAll('#ecodoacao-navbar .nav-link');
  
  for (const link of links) {
    const href = (link as HTMLAnchorElement).getAttribute('href') || '';
    link.classList.remove('active');
    
    // Match logic for different page paths
    if ((currentPath === '/' && href === '/') ||
        (currentPath !== '/' && currentPath.includes(href.replace(/^\//, '')))) {
      link.classList.add('active');
    }
  }
}
