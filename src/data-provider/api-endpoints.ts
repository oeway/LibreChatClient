const BASE_URL = "https://chat.imjoy.io"

export const user = () => {
  return `${BASE_URL}/api/user`;
};

export const userPlugins = () => {
  return `${BASE_URL}/api/user/plugins`;
};

export const messages = (id: string) => {
  return `${BASE_URL}/api/messages/${id}`;
};

export const abortRequest = (endpoint: string) => {
  return `${BASE_URL}/api/ask/${endpoint}/abort`;
};

export const conversations = (pageNumber: string) => {
  return `${BASE_URL}/api/convos?pageNumber=${pageNumber}`;
};

export const conversationById = (id: string) => {
  return `${BASE_URL}/api/convos/${id}`;
};

export const updateConversation = () => {
  return `${BASE_URL}/api/convos/update`;
};

export const deleteConversation = () => {
  return `${BASE_URL}/api/convos/clear`;
};

export const search = (q: string, pageNumber: string) => {
  return `${BASE_URL}/api/search?q=${q}&pageNumber=${pageNumber}`;
};

export const searchEnabled = () => {
  return `${BASE_URL}/api/search/enable`;
};

export const presets = () => {
  return `${BASE_URL}/api/presets`;
};

export const deletePreset = () => {
  return `${BASE_URL}/api/presets/delete`;
};

export const aiEndpoints = () => {
  return `${BASE_URL}/api/endpoints`;
};

export const tokenizer = () => {
  return `${BASE_URL}/api/tokenizer`;
};

export const login = () => {
  return `${BASE_URL}/api/auth/login`;
};

export const logout = () => {
  return `${BASE_URL}/api/auth/logout`;
};

export const register = () => {
  return `${BASE_URL}/api/auth/register`;
};

export const loginFacebook = () => {
  return `${BASE_URL}/api/auth/facebook`;
};

export const loginGoogle = () => {
  return `${BASE_URL}/api/auth/google`;
};

export const refreshToken = () => {
  return `${BASE_URL}/api/auth/refresh`;
};

export const requestPasswordReset = () => {
  return `${BASE_URL}/api/auth/requestPasswordReset`;
};

export const resetPassword = () => {
  return `${BASE_URL}/api/auth/resetPassword`;
};

export const plugins = () => {
  return `${BASE_URL}/api/plugins`;
};
