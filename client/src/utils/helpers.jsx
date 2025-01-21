/**
 * Return true if the app in running in production mode
 * @returns boolean
 */
const isInProduction = () => import.meta.env.MODE === 'production';

export {
  isInProduction,
};
