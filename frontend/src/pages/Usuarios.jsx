import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuarios.service";
import { esAdmin } from "../utils/auth";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  const isMobile = useMediaQuery("(max-width:768px)");

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "empleado",
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.log(error);
      alert("Error al cargar usuarios");
    }
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      correo: "",
      password: "",
      rol: "empleado",
    });

    setModoEdicion(false);
    setUsuarioId(null);
  };

  const cerrarModal = () => {
    limpiarFormulario();
    setOpen(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarUsuario = async () => {
    try {
      if (!form.nombre || !form.correo || !form.rol) {
        alert("Nombre, correo y rol son obligatorios");
        return;
      }

      if (!modoEdicion && !form.password) {
        alert("La contraseña es obligatoria");
        return;
      }

      if (modoEdicion) {
        await actualizarUsuario(usuarioId, form);
        alert("Usuario actualizado correctamente");
      } else {
        await crearUsuario(form);
        alert("Usuario creado correctamente");
      }

      await cargarUsuarios();
      cerrarModal();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.mensaje || "Error al guardar usuario");
    }
  };

  const editarUsuario = (usuario) => {
    setModoEdicion(true);
    setUsuarioId(usuario.id);

    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: "",
      rol: usuario.rol,
    });

    setOpen(true);
  };

  const borrarUsuario = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      await eliminarUsuario(id);
      await cargarUsuarios();
      alert("Usuario eliminado correctamente");
    } catch (error) {
      console.log(error);
      alert("Error al eliminar usuario");
    }
  };

  const badgeRol = (rol) => (
    <Box
      sx={{
        display: "inline-block",
        px: 2,
        py: 0.5,
        borderRadius: 5,
        fontWeight: "bold",
        fontSize: 12,
        bgcolor: rol === "admin" ? "#fde8f0" : "#e8f5e9",
        color: rol === "admin" ? "#cf5f8d" : "#2e7d32",
      }}
    >
      {rol === "admin" ? "Administrador" : "Empleado"}
    </Box>
  );

  if (!esAdmin()) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff7fa" }}>
        <Sidebar />

        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            p: { xs: 2, md: 4 },
            pt: { xs: 10, md: 4 },
            ml: { xs: 0, md: 3 },
          }}
        >
          <Typography fontWeight={900} color="#cf5f8d" sx={{ fontSize: 34 }}>
            Acceso denegado
          </Typography>

          <Typography color="#777">
            No tienes permisos para administrar usuarios.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff7fa" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 4 },
          ml: { xs: 0, md: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              fontWeight={900}
              color="#cf5f8d"
              sx={{ fontSize: { xs: 32, md: 34 } }}
            >
              Usuarios
            </Typography>

            <Typography color="#777">
              Administra administradores y empleados
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "#d95a8e",
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#cf4f82",
              },
            }}
          >
            Nuevo usuario
          </Button>
        </Box>

        {isMobile ? (
          <Box>
            {usuarios.map((usuario) => (
              <Card
                key={usuario.id}
                elevation={0}
                sx={{
                  mb: 2,
                  borderRadius: 4,
                  boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={900} fontSize={20} color="#333">
                        {usuario.nombre}
                      </Typography>

                      <Typography color="#777" fontSize={14} mt={0.5}>
                        📧 {usuario.correo}
                      </Typography>
                    </Box>

                    {badgeRol(usuario.rol)}
                  </Box>

                  <Typography mt={2} color="#777" fontSize={14}>
                    📅{" "}
                    {new Date(usuario.fecha_registro).toLocaleDateString(
                      "es-MX"
                    )}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Tooltip title="Editar usuario">
                      <IconButton
                        onClick={() => editarUsuario(usuario)}
                        sx={{
                          color: "#cf5f8d",
                          bgcolor: "#fde8f0",
                          "&:hover": {
                            bgcolor: "#f8d5e3",
                          },
                        }}
                      >
                        <BorderColorIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar usuario">
                      <IconButton
                        onClick={() => borrarUsuario(usuario.id)}
                        sx={{
                          color: "#e53935",
                          bgcolor: "#ffebee",
                          "&:hover": {
                            bgcolor: "#ffcdd2",
                          },
                        }}
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
              overflowX: "auto",
            }}
          >
            <CardContent>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Fecha registro</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.correo}</TableCell>
                      <TableCell>{badgeRol(usuario.rol)}</TableCell>
                      <TableCell>
                        {new Date(usuario.fecha_registro).toLocaleDateString(
                          "es-MX"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar usuario">
                          <IconButton
                            onClick={() => editarUsuario(usuario)}
                            sx={{
                              color: "#cf5f8d",
                              mr: 1,
                              bgcolor: "#fde8f0",
                              "&:hover": {
                                bgcolor: "#f8d5e3",
                              },
                            }}
                          >
                            <BorderColorIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar usuario">
                          <IconButton
                            onClick={() => borrarUsuario(usuario.id)}
                            sx={{
                              color: "#e53935",
                              bgcolor: "#ffebee",
                              "&:hover": {
                                bgcolor: "#ffcdd2",
                              },
                            }}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={open} onClose={cerrarModal} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight={900} color="#cf5f8d">
            {modoEdicion ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              margin="normal"
              value={form.nombre}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Correo"
              name="correo"
              margin="normal"
              value={form.correo}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label={modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
              name="password"
              type="password"
              margin="normal"
              value={form.password}
              onChange={handleChange}
            />

            <TextField
              select
              fullWidth
              label="Rol"
              name="rol"
              margin="normal"
              value={form.rol}
              onChange={handleChange}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="empleado">Empleado</MenuItem>
            </TextField>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={cerrarModal}>Cancelar</Button>

            <Button
              variant="contained"
              onClick={guardarUsuario}
              sx={{
                bgcolor: "#d95a8e",
                "&:hover": {
                  bgcolor: "#cf4f82",
                },
              }}
            >
              {modoEdicion ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Usuarios;
