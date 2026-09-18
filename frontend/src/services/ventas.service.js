import axios from "axios";

const API = "http://miservidor.com:3000/api/ventas";

export const crearVenta = async (venta) => {
  const response = await axios.post(API, venta);
  return response.data;
};

export const obtenerVentas = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const obtenerDetalleVenta = async (id) => {
  const response = await axios.get(`${API}/${id}/detalle`);
  return response.data;
};

export const eliminarVenta = async (id) => {
  const response = await axios.delete(`${API}/${id}`);
  return response.data;
};