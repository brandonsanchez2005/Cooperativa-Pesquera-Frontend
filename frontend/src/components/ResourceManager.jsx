import { useEffect, useMemo, useState } from 'react';
import { describeError, getAllRows, request, unwrapPage } from '../api';
import { canDelete, canWrite, labelFor, RESOURCES } from '../resources';

const numberFormat = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });
const currencyFormat = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 2 });
const moneyFields = new Set(['precio_kg', 'total', 'total_linea', 'monto', 'monto_bruto', 'total_gastos', 'monto_neto']);
const computedLabels = {
  id: 'ID', kilogramos_disponibles: 'Disponible (kg)', estado: 'Estado', merma_kg: 'Merma (kg)',
  total: 'Total', total_linea: 'Total de línea', monto_bruto: 'Monto bruto', total_gastos: 'Gastos', monto_neto: 'Monto neto',
};

function fieldLabel(resource, key) {
  return resource.fields.find((field) => field.key === key)?.label || computedLabels[key] || key.replaceAll('_', ' ');
}

function relationResource(endpoint) {
  return Object.entries(RESOURCES).find(([, config]) => config.endpoint === endpoint)?.[0];
}

function getOptions(options, endpoint) {
  return options[endpoint] || [];
}

function getOptionLabel(option, endpoint) {
  const key = relationResource(endpoint);
  return key ? labelFor(key, option) : `Registro ${option.id}`;
}

function formatDate(value, includeTime = false) {
  if (!value) return '—';
  const dateValue = includeTime ? new Date(value) : new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(dateValue.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-CR', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(dateValue);
}

function displayValue(value, key, resource, options = {}) {
  if (value === null || value === undefined || value === '') return '—';
  const field = resource.fields.find((item) => item.key === key);
  if (field?.type === 'relation') {
    const related = getOptions(options, field.endpoint).find((item) => String(item.id) === String(value));
    return related ? getOptionLabel(related, field.endpoint) : `#${value}`;
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (key.startsWith('fecha_') || key === 'fecha' || key === 'vigente_desde' || key === 'vigente_hasta') {
    return formatDate(value, String(value).includes('T'));
  }
  if (moneyFields.has(key)) return currencyFormat.format(Number(value));
  if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(String(value))) return numberFormat.format(Number(value));
  return String(value);
}

function optionParts(option) {
  return Array.isArray(option) ? { value: option[0], label: option[1] } : option;
}

function fieldInputValue(value, field) {
  if (field.type === 'boolean') return value === undefined || value === null ? true : Boolean(value);
  if (field.type === 'datetime-local' && value) {
    const dateValue = new Date(value);
    if (!Number.isNaN(dateValue.getTime())) {
      const localDate = new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    }
  }
  return value ?? '';
}

function FormDialog({ title, resource, record, options, busy, error, onClose, onSubmit }) {
  const initial = useMemo(() => Object.fromEntries(
    resource.fields.map((field) => [field.key, fieldInputValue(record?.[field.key], field)]),
  ), [resource, record]);
  const [values, setValues] = useState(initial);

  useEffect(() => setValues(initial), [initial]);

  function update(key, value) { setValues((current) => ({ ...current, [key]: value })); }
  function submit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(resource.fields.map((field) => [
      field.key,
      field.type === 'boolean' ? Boolean(values[field.key]) : values[field.key],
    ]));
    onSubmit(payload);
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="form-dialog-title">
        <div className="dialog-header"><div><div className="eyebrow">{record ? 'EDICIÓN' : 'NUEVO REGISTRO'}</div><h2 id="form-dialog-title">{title}</h2></div><button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button></div>
        <form onSubmit={submit}>
          <div className="dialog-body form-grid">
            {resource.fields.map((field) => (
              <div className={`form-field ${field.type === 'textarea' ? 'field-wide' : ''}`} key={field.key}>
                {field.type === 'boolean' ? (
                  <label className="form-check form-switch boolean-field"><input className="form-check-input" type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => update(field.key, event.target.checked)} /><span className="form-check-label">{field.label}</span></label>
                ) : <label className="form-label" htmlFor={`field-${field.key}`}>{field.label}{field.required && <span className="required-mark"> *</span>}</label>}
                {field.type === 'relation' ? (
                  <select id={`field-${field.key}`} className="form-select" required={field.required} value={values[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)}>
                    <option value="">Seleccione…</option>
                    {getOptions(options, field.endpoint).map((option) => <option key={option.id} value={option.id}>{getOptionLabel(option, field.endpoint)}</option>)}
                  </select>
                ) : field.type === 'choice' ? (
                  <select id={`field-${field.key}`} className="form-select" required={field.required} value={values[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)}>
                    <option value="">Seleccione…</option>
                    {field.options.map((item) => { const option = optionParts(item); return <option key={option.value} value={option.value}>{option.label}</option>; })}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea id={`field-${field.key}`} className="form-control" rows="3" value={values[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} />
                ) : field.type !== 'boolean' ? (
                  <input id={`field-${field.key}`} className="form-control" type={field.type === 'number' ? 'number' : field.type} inputMode={field.type === 'tel' ? 'tel' : undefined} pattern={field.type === 'tel' ? '[+]?[0-9 ().-]+' : undefined} title={field.type === 'tel' ? 'Use de 8 a 15 dígitos y, si lo necesita, separadores telefónicos.' : undefined} maxLength={field.type === 'tel' ? 20 : undefined} min={field.type === 'number' ? field.min ?? undefined : undefined} step={field.step || (field.type === 'number' ? 'any' : undefined)} required={field.required} value={values[field.key] ?? ''} onChange={(event) => update(field.key, field.type === 'tel' ? event.target.value.replace(/[^0-9+().\s-]/g, '') : event.target.value)} />
                ) : null}
              </div>
            ))}
          </div>
          {error && <div className="alert alert-danger dialog-error" role="alert">{error}</div>}
          <div className="dialog-footer"><span className="form-hint"><span className="required-mark">*</span> Campo obligatorio</span><div className="d-flex gap-2"><button type="button" className="btn btn-light" onClick={onClose} disabled={busy}>Cancelar</button><button type="submit" className="btn btn-sea" disabled={busy}>{busy ? 'Guardando…' : record ? 'Guardar cambios' : 'Crear registro'}</button></div></div>
        </form>
      </section>
    </div>
  );
}

function DetailDialog({ resource, record, options, onClose }) {
  if (!record) return null;
  const keys = [...new Set([...resource.columns, ...Object.keys(record)])];
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog-card detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-dialog-title">
        <div className="dialog-header"><div><div className="eyebrow">VISTA DE REGISTRO</div><h2 id="detail-dialog-title">{resource.title} · #{record.id}</h2></div><button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button></div>
        <dl className="detail-list">{keys.map((key) => <div className="detail-row" key={key}><dt>{fieldLabel(resource, key)}</dt><dd>{displayValue(record[key], key, resource, options)}</dd></div>)}</dl>
        <div className="dialog-footer"><button className="btn btn-light ms-auto" onClick={onClose}>Cerrar</button></div>
      </section>
    </div>
  );
}

export default function ResourceManager({ resourceKey, resource, user }) {
  const token = localStorage.getItem('cooperativa.token');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState(resource.ordering?.[0]?.[0] || '');
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const lookupEndpoints = useMemo(() => [...new Set([
    ...resource.fields.filter((field) => field.type === 'relation').map((field) => field.endpoint),
    ...(resource.filters || []).filter((field) => field.type === 'relation').map((field) => field.endpoint),
  ])], [resource]);

  useEffect(() => {
    let active = true;
    if (!lookupEndpoints.length) return undefined;
    Promise.all(lookupEndpoints.map(async (endpoint) => [endpoint, await getAllRows(endpoint, token)]))
      .then((entries) => { if (active) setOptions(Object.fromEntries(entries)); })
      .catch(() => { if (active) setOptions({}); });
    return () => { active = false; };
  }, [lookupEndpoints.join('|'), token]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      request(resource.endpoint, { token, params: { page, search, ordering, ...filters } })
        .then((payload) => {
          if (!active) return;
          const result = unwrapPage(payload);
          setRows(result.rows);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        })
        .catch((requestError) => { if (active) setError(describeError(requestError)); })
        .finally(() => { if (active) setLoading(false); });
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [resource.endpoint, token, page, search, ordering, filters]);

  const writable = canWrite(user) && !resource.readOnly;
  const deletable = canDelete(user) && !resource.readOnly;

  function applySearch(event) { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }
  function updateFilter(key, value) { setPage(1); setFilters((current) => ({ ...current, [key]: value })); }
  function clearFilters() { setFilters({}); setSearchInput(''); setSearch(''); setOrdering(resource.ordering?.[0]?.[0] || ''); setPage(1); }

  async function openDetail(row) {
    setDialogError('');
    try {
      const record = await request(`${resource.endpoint}${row.id}/`, { token });
      setDetail(record);
    } catch (requestError) {
      setError(describeError(requestError));
    }
  }

  async function saveRecord(payload) {
    setSaving(true);
    setDialogError('');
    try {
      const path = dialog.record ? `${resource.endpoint}${dialog.record.id}/` : resource.endpoint;
      await request(path, { token, method: dialog.record ? 'PATCH' : 'POST', body: payload });
      setDialog(null);
      setNotice(dialog.record ? 'Los cambios se guardaron correctamente.' : 'El registro se creó correctamente.');
      setPage(1);
      setSearch('');
      setSearchInput('');
      window.setTimeout(() => setNotice(''), 4500);
    } catch (requestError) {
      setDialogError(describeError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(row) {
    if (!window.confirm(`¿Eliminar ${resource.title.toLowerCase()} #${row.id}? La API puede rechazarlo si tiene registros relacionados.`)) return;
    setDeleting(row.id);
    setError('');
    try {
      await request(`${resource.endpoint}${row.id}/`, { token, method: 'DELETE' });
      setNotice('El registro se eliminó correctamente.');
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      else setRows((current) => current.filter((item) => item.id !== row.id));
      setTotal((current) => Math.max(0, current - 1));
      window.setTimeout(() => setNotice(''), 4500);
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="resource-panel">
      <div className="resource-heading">
        <div><div className="eyebrow">REGISTROS DEL MÓDULO</div><h2>{resource.title}</h2><p>Datos consultados directamente desde Cooperativa Pesquera.</p></div>
        {writable && <button className="btn btn-sea create-button" onClick={() => { setDialog({ record: null }); setDialogError(''); }}><span aria-hidden="true">＋</span> Nuevo registro</button>}
      </div>

      {resource.readOnly && <div className="alert alert-info alert-compact">Estas alertas provienen de los lotes con existencia que vencen pronto o ya vencieron.</div>}
      {notice && <div className="alert alert-success alert-compact" role="status">{notice}</div>}
      {error && <div className="alert alert-danger alert-compact" role="alert">{error}</div>}

      {!resource.readOnly && <div className="toolbar-card">
        <form className="search-form" onSubmit={applySearch}>
          <label htmlFor={`search-${resourceKey}`} className="visually-hidden">{resource.search || 'Buscar'}</label>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input id={`search-${resourceKey}`} className="form-control" placeholder={resource.search || 'Buscar registros'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <button className="btn btn-outline-sea" type="submit">Buscar</button>
        </form>
        {resource.ordering?.length > 0 && <label className="sort-control"><span>Ordenar</span><select className="form-select" value={ordering} onChange={(event) => { setPage(1); setOrdering(event.target.value); }}>
          {resource.ordering.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select></label>}
      </div>}

      {resource.filters?.length > 0 && <div className="filter-card"><div className="filter-title"><span>Filtros</span><button className="btn btn-link btn-sm" onClick={clearFilters} type="button">Limpiar</button></div><div className="filter-grid">
        {resource.filters.map((field) => <div key={field.key} className="filter-field"><label htmlFor={`filter-${field.key}`}>{field.label}</label>
          {field.type === 'relation' ? <select id={`filter-${field.key}`} className="form-select form-select-sm" value={filters[field.key] || ''} onChange={(event) => updateFilter(field.key, event.target.value)}><option value="">Todos</option>{getOptions(options, field.endpoint).map((item) => <option value={item.id} key={item.id}>{getOptionLabel(item, field.endpoint)}</option>)}</select>
            : field.type === 'choice' ? <select id={`filter-${field.key}`} className="form-select form-select-sm" value={filters[field.key] || ''} onChange={(event) => updateFilter(field.key, event.target.value)}><option value="">Todos</option>{field.options.map((item) => { const option = optionParts(item); return <option value={option.value} key={option.value}>{option.label}</option>; })}</select>
              : <input id={`filter-${field.key}`} className="form-control form-control-sm" value={filters[field.key] || ''} onChange={(event) => updateFilter(field.key, event.target.value)} placeholder="Cualquier valor" />}
        </div>)}
      </div></div>}

      <div className="table-card">
        <div className="table-caption"><span><strong>{numberFormat.format(total)}</strong> registros</span><span>{resource.readOnly ? 'Consulta de alertas' : 'Resultados actualizados desde la API'}</span></div>
        <div className="table-responsive">
          <table className="table data-table align-middle mb-0">
            <thead><tr>{resource.columns.map((key) => <th key={key} scope="col">{fieldLabel(resource, key)}</th>)}<th className="actions-column" scope="col">Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={resource.columns.length + 1} className="table-state"><span className="spinner-border spinner-border-sm text-sea me-2" />Cargando datos…</td></tr>
                : rows.length === 0 ? <tr><td colSpan={resource.columns.length + 1} className="table-state"><div className="empty-icon small-empty">∅</div><strong>No hay registros para mostrar</strong><span>Pruebe ajustar la búsqueda o los filtros.</span></td></tr>
                  : rows.map((row) => <tr key={row.id}>{resource.columns.map((key) => <td key={key}>{key === 'estado' ? <span className={`state-pill state-${String(row[key] || '').toLowerCase()}`}>{displayValue(row[key], key, resource, options)}</span> : displayValue(row[key], key, resource, options)}</td>)}
                    <td className="row-actions">{!resource.readOnly && <button className="icon-action" title="Ver detalle" aria-label={`Ver detalle ${row.id}`} onClick={() => openDetail(row)}>◉</button>}{writable && <button className="icon-action" title="Editar" aria-label={`Editar ${row.id}`} onClick={() => { setDialog({ record: row }); setDialogError(''); }}>✎</button>}{deletable && <button className="icon-action danger-action" title="Eliminar" aria-label={`Eliminar ${row.id}`} disabled={deleting === row.id} onClick={() => deleteRecord(row)}>{deleting === row.id ? '…' : '×'}</button>}</td>
                  </tr>)}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar"><span>Página {page} de {Math.max(1, totalPages)}</span><div className="pagination-actions"><button className="btn btn-sm btn-outline-muted" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><button className="btn btn-sm btn-outline-muted" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}>Siguiente</button></div></div>
      </div>
      <div className="resource-footer-note"><span className="note-mark">i</span> El servidor valida las reglas de negocio y los permisos antes de guardar o eliminar.</div>

      {dialog && <FormDialog title={resource.title} resource={resource} record={dialog.record} options={options} busy={saving} error={dialogError} onClose={() => setDialog(null)} onSubmit={saveRecord} />}
      {detail && <DetailDialog resource={resource} record={detail} options={options} onClose={() => setDetail(null)} />}
    </section>
  );
}