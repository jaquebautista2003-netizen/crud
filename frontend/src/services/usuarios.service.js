import axios from "axios";

const API = "http://miservidor.com:3000/api/usuarios";

export const getUsuarios = async () => {
  const response = await axios.get(API);
  return response.data;
};

export const crearUsuario = async (usuario) => {
  const response = await axios.post(API, usuario);
  return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
  const response = await axios.put(`${API}/${id}`, usuario);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await axios.delete(`${API}/${id}`);
  return response.data;
};