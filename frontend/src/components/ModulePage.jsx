import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth';
import { RESOURCES, visibleModules } from '../resources';
import ResourceManager from './ResourceManager';

export default function ModulePage({ moduleId }) {
  const { user } = useAuth();
  const module = visibleModules(user).find((item) => item.key === moduleId);
  const [resourceKey, setResourceKey] = useState(module?.resources[0] || '');

  if (!module) {
    return (
      <main className="content-area">
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <h2>Módulo no disponible</h2>
          <p>Revise su perfil o vuelva al resumen.</p>
          <NavLink to="/app" className="btn btn-outline-sea">Ir al resumen</NavLink>
        </div>
      </main>
    );
  }

  const selectedResource = module.resources.includes(resourceKey)
    ? resourceKey
    : module.resources[0];
  const resource = RESOURCES[selectedResource];

  return (
    <main className="content-area">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{module.eyebrow}</div>
          <h1>{module.title}</h1>
          <p>Consulte información real de la API y gestione los registros permitidos para su perfil.</p>
        </div>
        <span className="module-badge">{module.icon}</span>
      </div>
      <div className="module-tabs" role="tablist" aria-label={`Recursos de ${module.title}`}>
        {module.resources.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={key === selectedResource}
            className={`module-tab ${key === selectedResource ? 'active' : ''}`}
            onClick={() => setResourceKey(key)}
          >
            {RESOURCES[key].title}
          </button>
        ))}
      </div>
      <ResourceManager
        key={selectedResource}
        resourceKey={selectedResource}
        resource={resource}
        user={user}
      />
    </main>
  );
}
