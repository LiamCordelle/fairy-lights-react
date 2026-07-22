const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiBaseUrl || 'http://192.168.1.69:8080'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const requestJson = async (path, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const externalSignal = options.signal;
  let timedOut = false;

  const cancelFromExternalSignal = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', cancelFromExternalSignal, { once: true });
    }
  }

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      if (response.ok) {
        throw new ApiError('The controller returned an invalid response.', response.status);
      }
    }

    if (!response.ok) {
      throw new ApiError(
        data?.error || `The controller returned HTTP ${response.status}.`,
        response.status,
      );
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(
        timedOut ? 'The controller did not respond in time.' : 'The request was cancelled.',
      );
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Could not reach the fairy-lights controller.');
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', cancelFromExternalSignal);
  }
};

export const getModes = () => requestJson('/getModes');
export const getActiveStatus = () => requestJson('/activeMode');
export const getTemperature = () => requestJson('/getTemperature');

export const setMode = (mode) =>
  requestJson(`/activeMode/${encodeURIComponent(mode)}`, { method: 'POST' });

export const setTimer = (target, minutes, fadePeriod) =>
  requestJson(`/timer/${target}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes, fadePeriod }),
  });

export const cancelTimer = () => requestJson('/timer', { method: 'DELETE' });
