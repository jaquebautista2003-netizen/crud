import axios from "axios";

const API = "http://miservidor.com:3000/api/auth";

export const login = async (datos) => {
  const response = await axios.post(`${API}/login`, datos);
  return response.data;
};