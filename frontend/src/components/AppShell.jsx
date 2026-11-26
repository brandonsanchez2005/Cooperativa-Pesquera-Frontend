import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { visibleModules } from '../resources';

export default function AppShell() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const modules = visibleModules(user);
  const roleLabel = user?.rol || 'Sin perfil';

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  return (
    <div className="app-shell">
      <button
        className={`sidebar-backdrop ${mobileNavOpen ? 'is-open' : ''}`}
        aria-label="Cerrar menú"
        onClick={closeMobileNav}
      />
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">CP</div>
          <div><strong>Cooperativa</strong><span>Pesquera</span></div>
          <button className="sidebar-close btn btn-sm" onClick={closeMobileNav} aria-label="Cerrar menú">×</button>
        </div>
        <div className="sidebar-label">ESPACIO DE TRABAJO</div>
        <nav className="side-nav" aria-label="Navegación principal">
          <NavLink to="/app" end onClick={closeMobileNav} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⌂</span><span>Resumen</span>
          </NavLink>
          <div className="sidebar-label module-label">MÓDULOS</div>
          {modules.map((module) => (
            <NavLink
              key={module.key}
              to={`/app/modulos/${module.key}`}
              onClick={closeMobileNav}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon nav-initials">{module.icon}</span>
              <span>{module.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-mark">i</div>
            <div><strong>¿Necesita ayuda?</strong><span>Consulte la guía del sistema</span></div>
          </div>
          <div className="sidebar-version">Panel de gestión · Proyecto 2</div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu btn" onClick={() => setMobileNavOpen(true)} aria-label="Abrir menú">☰</button>
          <div className="topbar-context">
            <span>Cooperativa Pesquera</span>
            <span className="crumb-separator">/</span>
            <span className="context-current">Operaciones</span>
          </div>
          <div className="topbar-actions">
            <div className="user-summary">
              <div className="user-avatar">{(user?.nombre || user?.username || 'U').slice(0, 1).toUpperCase()}</div>
              <div className="user-lines">
                <strong>{user?.nombre || user?.username}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
            <button className="btn btn-logout" onClick={logout} title="Cerrar sesión">
              <span aria-hidden="true">↪</span><span className="logout-text">Salir</span>
            </button>
          </div>
        </header>
        {user?.rol
          ? <Outlet />
          : (
            <main className="content-area">
              <div className="alert alert-warning">
                Su usuario inició sesión, pero no tiene asignado un perfil autorizado en Django.
                Solicite que lo agreguen a Administrador, Operador o Consulta.
              </div>
            </main>
          )}
      </div>
    </div>
  );
}
