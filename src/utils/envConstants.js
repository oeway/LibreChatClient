const ALLOW_REGISTRATION = import.meta.env.ALLOW_REGISTRATION === 'true';
const DOMAIN_SERVER = import.meta.env.DOMAIN_SERVER;
const SHOW_GOOGLE_LOGIN_OPTION = import.meta.env.VITE_SHOW_GOOGLE_LOGIN_OPTION === 'true';

export {
  ALLOW_REGISTRATION,
  DOMAIN_SERVER,
  SHOW_GOOGLE_LOGIN_OPTION
};
