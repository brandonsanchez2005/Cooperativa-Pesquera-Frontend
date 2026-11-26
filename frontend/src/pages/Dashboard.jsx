import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { request, unwrapPage } from '../api';
import { useAuth } from '../auth';
import { visibleModules } from '../resources';

const number = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      request('/faenas/', { token, params: { page: 1 } }).then(unwrapPage),
      request('/capturas/', { token, params: { page: 1 } }).then(unwrapPage),
      request('/faenas/resumen-capturas/', { token }),
    ]).then(([faenas, capturas, resumen]) => {
      if (!active) return;
      setStats({
        faenas: faenas.total,
        capturas: capturas.total,
        kilos: Array.isArray(resumen) ? resumen.reduce((sum, item) => sum + Number(item.kilogramos_totales || 0), 0) : 0,
        especies: Array.isArray(resumen) ? resumen.length : 0,
      });
      setError('');
    }).catch((requestError) => {
      if (active) setError(requestError.message || 'No se pudieron cargar los indicadores.');
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [token]);

  const modules = visibleModules(user);
  const cards = [
    { label: 'Faenas registradas', value: stats?.faenas, note: 'Total según la API', icon: 'F', tone: 'aqua' },
    { label: 'Capturas registradas', value: stats?.capturas, note: 'Total según la API', icon: 'C', tone: 'blue' },
    { label: 'Kilogramos capturados', value: stats?.kilos, note: `${stats?.especies ?? 0} especies en el resumen`, icon: 'kg', tone: 'sand' },
  ];

  return (
    <main className="content-area dashboard-content">
      <div className="welcome-row">
        <div><div className="eyebrow">PANEL GENERAL</div><h1>Buenos días, {user?.nombre?.split(' ')[0] || user?.username}</h1><p>Este es el estado de la operación con datos actuales del sistema.</p></div>
        <div className="today-card"><span className="today-icon">◷</span><div><span>FECHA DE HOY</span><strong>{new Intl.DateTimeFormat('es-CR', { dateStyle: 'long' }).format(new Date())}</strong></div></div>
      </div>

      {error && <div className="alert alert-warning" role="status">No fue posible cargar todos los indicadores: {error}</div>}
      <section className="stat-grid" aria-label="Indicadores de operación">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <div className={`stat-icon ${card.tone}`}>{card.icon}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{busy ? <span className="placeholder-wave"><span className="placeholder col-4" /></span> : number.format(card.value ?? 0)}</div>
            <div className="stat-note"><span className="status-dot" />{card.note}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-lower">
        <div className="panel-card module-overview">
          <div className="section-heading"><div><div className="eyebrow">ACCESO RÁPIDO</div><h2>Módulos de trabajo</h2></div><span className="section-count">{modules.length} disponibles</span></div>
          <div className="module-card-grid">
            {modules.map((module) => (
              <NavLink to={`/app/modulos/${module.key}`} className="module-card" key={module.key}>
                <div className="module-card-icon">{module.icon}</div>
                <div><strong>{module.title}</strong><span>{module.eyebrow}</span></div>
                <span className="module-arrow">↗</span>
              </NavLink>
            ))}
          </div>
        </div>
        <aside className="panel-card profile-card">
          <div className="eyebrow">SU PERFIL</div>
          <div className="profile-avatar">{(user?.nombre || 'U').slice(0, 1).toUpperCase()}</div>
          <h2>{user?.nombre || user?.username}</h2>
          <span className="role-pill">{user?.rol}</span>
          <p>Los módulos y las acciones visibles dependen de los permisos asignados en el servidor.</p>
          <div className="profile-divider" />
          <div className="profile-meta"><span>Usuario</span><strong>{user?.username}</strong></div>
          {user?.pescador_id && <div className="profile-meta"><span>Perfil de pescador</span><strong>#{user.pescador_id}</strong></div>}
        </aside>
      </section>
      <div className="dashboard-note"><span className="note-mark">i</span> Los indicadores se consultan desde la API autenticada; los permisos del servidor siempre prevalecen.</div>
    </main>
  );
}
