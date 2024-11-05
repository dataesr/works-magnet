/**
 * Return true if the app in running in production mode
 * @returns boolean
 */
export function isInProduction() {
  return import.meta.env === 'production';
}
