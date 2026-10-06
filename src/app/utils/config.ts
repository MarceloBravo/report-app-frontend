export function readBaseUrl(): string {
  const baseUrl = import.meta.env['NG_APP_BACKEND_API_URL'];

  if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
    throw new Error(
      'NG_APP_BACKEND_API_URL no está definida. Agrégala al archivo .env de la aplicación.',
    );
  }

  return baseUrl;
}
