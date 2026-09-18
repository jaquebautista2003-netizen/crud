import axios from "axios";

const API = "http://miservidor.com/api/productos";

export const getProductos = async () => {
    const response = await axios.get(API);
    return response.data;
};

export const crearProducto = async (formData) => {
    const response = await axios.post(API, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};
export const actualizarProducto = async (id, formData) => {
    const response = await axios.put(`${API}/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const eliminarProducto = async (id) => {
    const response = await axios.delete(`${API}/${id}`);
    return response.data;
};

export const getCategorias = async () => {
    const response = await axios.get(`${API}/categorias`);
    return response.data;
};