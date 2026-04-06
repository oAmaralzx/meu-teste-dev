import axios from 'axios';

// Criamos uma instância do Axios apontando para o seu Node.js
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Função para configurar o Token nas futuras chamadas
export const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;