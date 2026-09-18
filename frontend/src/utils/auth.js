export const getUsuario = () => {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
};

export const esAdmin = () => {
  const usuario = getUsuario();
  return usuario?.rol === "admin";
};

export const esEmpleado = () => {
  const usuario = getUsuario();
  return usuario?.rol === "empleado";
};