const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function describeError(error) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) {
    return 'No se pudo conectar con la API. Verifique que Django esté activo y que VITE_API_BASE_URL sea correcta.';
  }
  return error?.message || 'Ocurrió un error inesperado.';
}

function messageFromPayload(payload, status) {
  if (payload && typeof payload === 'object') {
    if (typeof payload.detail === 'string') return payload.detail;
    const messages = Object.entries(payload).flatMap(([field, value]) => {
      const items = Array.isArray(value) ? value : [value];
      return items
        .filter((item) => typeof item === 'string')
        .map((item) => field === 'non_field_errors' ? item : `${field}: ${item}`);
    });
    if (messages.length) return messages.join(' ');
  }
  if (status === 401) return 'La sesión no está autenticada. Inicie sesión de nuevo.';
  if (status === 403) return 'Su perfil no tiene permiso para realizar esta operación.';
  if (status === 404) return 'El registro solicitado ya no está disponible.';
  if (status === 409) return 'No se pudo completar la operación porque hay información relacionada.';
  return `La API respondió con el estado ${status}.`;
}

export async function request(path, { token, method = 'GET', body, params, headers = {} } = {}) {
  const query = params ? new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ).toString() : '';
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}${query ? `?${query}` : ''}`;
  const requestHeaders = { Accept: 'application/json', ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (token) requestHeaders.Authorization = `Token ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new TypeError('No fue posible alcanzar el servidor.');
  }

  if (response.status === 204) return null;
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try { payload = JSON.parse(raw); } catch { payload = { detail: raw }; }
  }
  if (!response.ok) {
    throw new ApiError(messageFromPayload(payload, response.status), response.status, payload);
  }
  return payload;
}

export function unwrapPage(payload) {
  if (Array.isArray(payload)) return { rows: payload, page: 1, totalPages: 1, total: payload.length };
  return {
    rows: payload?.resultados || [],
    page: payload?.pagina_actual || 1,
    totalPages: payload?.total_paginas || 1,
    total: payload?.total_registros || 0,
  };
}

export async function getAllRows(path, token) {
  const first = unwrapPage(await request(path, { token, params: { page: 1 } }));
  if (first.totalPages <= 1) return first.rows;
  const remaining = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      request(path, { token, params: { page: index + 2 } }).then(unwrapPage),
    ),
  );
  return first.rows.concat(...remaining.map((page) => page.rows));
}

export { API_BASE };