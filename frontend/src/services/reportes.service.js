import axios from "axios";

const API = "http://miservidor.com:3000/api/reportes";

const crearParams = (inicio, fin) => {
  const params = {};

  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;

  return params;
};

export const getResumenReportes = async (inicio, fin) => {
  const response = await axios.get(`${API}/resumen`, {
    params: crearParams(inicio, fin),
  });
  return response.data;
};

export const getVentasPorDia = async (inicio, fin) => {
  const response = await axios.get(`${API}/ventas-dia`, {
    params: crearParams(inicio, fin),
  });
  return response.data;
};

export const getTopProductos = async (inicio, fin) => {
  const response = await axios.get(`${API}/top-productos`, {
    params: crearParams(inicio, fin),
  });
  return response.data;
};