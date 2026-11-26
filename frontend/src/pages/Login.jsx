import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, describeError } from '../api';
import { useAuth } from '../auth';

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/app" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(location.state?.from?.pathname || '/app', { replace: true });
    } catch (requestError) {
      const message = describeError(requestError);
      setError(requestError instanceof ApiError && [400, 401].includes(requestError.status)
        ? 'Usuario o contraseña incorrectos.'
        : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">CP</div>
          <span>Cooperativa<br />Pesquera</span>
        </div>
        <div className="login-copy">
          <div className="eyebrow">PORTAL DE GESTIÓN</div>
          <h1>Bienvenido de vuelta</h1>
          <p>Acceda para consultar y gestionar la operación de la cooperativa.</p>
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <form onSubmit={submit} className="login-form">
          <label className="form-label" htmlFor="username">Usuario</label>
          <input
            id="username"
            className="form-control form-control-lg"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <label className="form-label mt-3" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="form-control form-control-lg"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="btn btn-sea btn-lg w-100 mt-4" type="submit" disabled={busy}>
            {busy
              ? <><span className="spinner-border spinner-border-sm me-2" />Validando acceso…</>
              : 'Iniciar sesión'}
          </button>
        </form>
        <div className="login-footnote"><span className="status-dot" /> Conexión segura con la API de la cooperativa</div>
      </section>
      <aside className="login-visual" aria-label="Información de la cooperativa">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="visual-copy">
          <span className="visual-kicker">DEL MAR A LA MESA</span>
          <h2>Una operación clara,<br />de principio a fin.</h2>
          <p>Faenas, inventario, procesamiento, pedidos y liquidaciones en un solo espacio de trabajo.</p>
        </div>
        <div className="visual-wave wave-one" />
        <div className="visual-wave wave-two" />
      </aside>
    </main>
  );
}
