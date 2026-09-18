import axios from "axios";

const API = "http://miservidor.com:3000/api/inventario";

export const getResumenInventario = async () => {
  const response = await axios.get(`${API}/resumen`);
  return response.data;
};