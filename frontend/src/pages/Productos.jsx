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
    useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
    getProductos,
    crearProducto,
    getCategorias,
    actualizarProducto,
    eliminarProducto as eliminarProductoService,
} from "../services/productos.service";
import { esAdmin } from "../utils/auth";

function Productos() {
    const [open, setOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [preview, setPreview] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [productoId, setProductoId] = useState(null);

    const esMovil = useMediaQuery("(max-width:768px)");

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        categoria_id: "",
        talla: "",
        color: "",
        precio: "",
        stock: "",
        imagen: null,
        imagen_actual: "",
    });

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await getProductos();
            setProductos(data);
        } catch (error) {
            console.log(error);
            alert("Error al cargar productos");
        }
    };

    const cargarCategorias = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.log(error);
            alert("Error al cargar categorías");
        }
    };

    const productosFiltrados = productos.filter((producto) => {
        const texto = busqueda.toLowerCase();

        return (
            producto.nombre?.toLowerCase().includes(texto) ||
            producto.categoria?.toLowerCase().includes(texto) ||
            producto.color?.toLowerCase().includes(texto) ||
            producto.talla?.toLowerCase().includes(texto)
        );
    });

    const totalProductos = productos.length;
    const disponibles = productos.filter((p) => Number(p.stock) > 5).length;
    const stockBajo = productos.filter(
        (p) => Number(p.stock) > 0 && Number(p.stock) <= 5
    ).length;
    const agotados = productos.filter((p) => Number(p.stock) === 0).length;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImagen = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setForm({ ...form, imagen: archivo });
        setPreview(URL.createObjectURL(archivo));
    };

    const limpiarFormulario = () => {
        setForm({
            nombre: "",
            descripcion: "",
            categoria_id: "",
            talla: "",
            color: "",
            precio: "",
            stock: "",
            imagen: null,
            imagen_actual: "",
        });

        setPreview(null);
        setModoEdicion(false);
        setProductoId(null);
    };

    const cerrarModal = () => {
        limpiarFormulario();
        setOpen(false);
    };

    const guardarProducto = async () => {
        if (!esAdmin()) {
            alert("No tienes permisos para realizar esta acción");
            return;
        }

        if (Number(form.precio) < 0) {
            alert("El precio no puede ser negativo");
            return;
        }

        if (Number(form.stock) < 0) {
            alert("El stock no puede ser negativo");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("nombre", form.nombre);
            formData.append("descripcion", form.descripcion);
            formData.append("categoria_id", form.categoria_id);
            formData.append("talla", form.talla);
            formData.append("color", form.color);
            formData.append("precio", form.precio);
            formData.append("stock", form.stock || 0);

            if (form.imagen) formData.append("imagen", form.imagen);
            if (form.imagen_actual) formData.append("imagen_actual", form.imagen_actual);

            if (modoEdicion) {
                await actualizarProducto(productoId, formData);
                alert("Producto actualizado correctamente");
            } else {
                await crearProducto(formData);
                alert("Producto guardado correctamente");
            }

            await cargarProductos();
            limpiarFormulario();
            setOpen(false);
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.mensaje || "Error");
        }
    };

    const editarProducto = (producto) => {
        if (!esAdmin()) return;

        setModoEdicion(true);
        setProductoId(producto.id);

        setForm({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            categoria_id: producto.categoria_id || "",
            talla: producto.talla || "",
            color: producto.color || "",
            precio: producto.precio || "",
            stock: producto.stock || "",
            imagen: null,
            imagen_actual: producto.imagen || "",
        });

        setPreview(producto.imagen ? obtenerImagen(producto.imagen) : null);
        setOpen(true);
    };

    const eliminarProducto = async (id) => {
        if (!esAdmin()) return;

        const confirmar = window.confirm("¿Deseas eliminar este producto?");
        if (!confirmar) return;

        try {
            await eliminarProductoService(id);
            await cargarProductos();
            alert("Producto eliminado correctamente");
        } catch (error) {
            console.log(error);
            alert("Error al eliminar producto");
        }
    };

    const obtenerImagen = (imagen) => {
        if (!imagen) return null;
        if (imagen.startsWith("http")) return imagen;
        return `http://localhost:3000${imagen}`;
    };

    const obtenerEstadoStock = (stock) => {
        const cantidad = Number(stock);

        if (cantidad === 0) {
            return { texto: "Agotado", color: "#d32f2f", fondo: "#ffebee" };
        }

        if (cantidad <= 5) {
            return { texto: "Stock Bajo", color: "#ed6c02", fondo: "#fff3e0" };
        }

        return { texto: "Disponible", color: "#2e7d32", fondo: "#e8f5e9" };
    };

    const renderEstado = (producto) => {
        const estado = obtenerEstadoStock(producto.stock);

        return (
            <Box
                sx={{
                    display: "inline-block",
                    px: 2,
                    py: 0.5,
                    borderRadius: 5,
                    fontWeight: "bold",
                    fontSize: 12,
                    backgroundColor: estado.fondo,
                    color: estado.color,
                }}
            >
                {estado.texto}
            </Box>
        );
    };

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
                        <Typography variant="h4" fontWeight={900} color="#cf5f8d">
                            Productos
                        </Typography>
                        <Typography color="#777">
                            Administra ropa, accesorios, tallas y stock
                        </Typography>
                    </Box>

                    {esAdmin() && (
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
                                "&:hover": { bgcolor: "#cf4f82" },
                            }}
                        >
                            Nuevo producto
                        </Button>
                    )}
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Card elevation={0} sx={resumenCard}>
                        <Typography color="#777" fontSize={{ xs: 12, md: 14 }}>
                            Total productos
                        </Typography>
                        <Typography fontWeight={900} fontSize={{ xs: 22, md: 28 }} color="#cf5f8d">
                            {totalProductos}
                        </Typography>
                    </Card>

                    <Card elevation={0} sx={resumenCard}>
                        <Typography color="#777" fontSize={{ xs: 12, md: 14 }}>
                            Disponibles
                        </Typography>
                        <Typography fontWeight={900} fontSize={{ xs: 22, md: 28 }} color="#2e7d32">
                            {disponibles}
                        </Typography>
                    </Card>

                    <Card elevation={0} sx={resumenCard}>
                        <Typography color="#777" fontSize={{ xs: 12, md: 14 }}>
                            Stock bajo
                        </Typography>
                        <Typography fontWeight={900} fontSize={{ xs: 22, md: 28 }} color="#ed6c02">
                            {stockBajo}
                        </Typography>
                    </Card>

                    <Card elevation={0} sx={resumenCard}>
                        <Typography color="#777" fontSize={{ xs: 12, md: 14 }}>
                            Agotados
                        </Typography>
                        <Typography fontWeight={900} fontSize={{ xs: 22, md: 28 }} color="#d32f2f">
                            {agotados}
                        </Typography>
                    </Card>
                </Box>

                <TextField
                    fullWidth
                    placeholder="Buscar por nombre, categoría, talla o color..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    sx={{
                        mb: 3,
                        bgcolor: "#fff",
                        borderRadius: 3,
                        "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#cf5f8d" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {esMovil ? (
                    <Box
                        sx={{
                            display: "grid",
                            gridAutoFlow: "column",
                            gridAutoColumns: "160px",
                            gap: 2,
                            overflowX: "auto",
                            pb: 2,
                            scrollSnapType: "x mandatory",
                            "&::-webkit-scrollbar": {
                                height: 6,
                            },
                            "&::-webkit-scrollbar-thumb": {
                                bgcolor: "#d95a8e",
                                borderRadius: 10,
                            },
                        }}
                    >
                        {productosFiltrados.map((producto) => (
                            <Card
                                key={producto.id}
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    scrollSnapAlign: "start",
                                    boxShadow: "0 8px 20px rgba(177,112,139,0.14)",
                                }}
                            >
                                {producto.imagen ? (
                                    <Box
                                        component="img"
                                        src={obtenerImagen(producto.imagen)}
                                        alt={producto.nombre}
                                        sx={{
                                            width: "100%",
                                            height: 115,
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: 115,
                                            bgcolor: "#fde8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#d95a8e",
                                            fontSize: 12,
                                        }}
                                    >
                                        Sin foto
                                    </Box>
                                )}

                                <CardContent sx={{ p: 1.5 }}>
                                    <Typography fontWeight={900} fontSize={15} noWrap>
                                        {producto.nombre}
                                    </Typography>

                                    <Typography color="#777" fontSize={12} noWrap>
                                        {producto.categoria}
                                    </Typography>

                                    <Typography fontWeight={900} color="#cf5f8d" fontSize={18} mt={0.5}>
                                        ${Number(producto.precio).toFixed(2)}
                                    </Typography>

                                    <Typography color="#777" fontSize={12}>
                                        Stock: {producto.stock}
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>{renderEstado(producto)}</Box>

                                    {esAdmin() && (
                                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => editarProducto(producto)}
                                                sx={{
                                                    color: "#cf5f8d",
                                                    bgcolor: "#fde8f0",
                                                    "&:hover": { bgcolor: "#f8d5e3" },
                                                }}
                                            >
                                                <BorderColorIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                onClick={() => eliminarProducto(producto.id)}
                                                sx={{
                                                    color: "#e53935",
                                                    bgcolor: "#ffebee",
                                                    "&:hover": { bgcolor: "#ffcdd2" },
                                                }}
                                            >
                                                <DeleteForeverIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
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
                            <Table sx={{ minWidth: 900 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Imagen</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Categoría</TableCell>
                                        <TableCell>Talla</TableCell>
                                        <TableCell>Color</TableCell>
                                        <TableCell>Precio</TableCell>
                                        <TableCell>Stock</TableCell>
                                        <TableCell align="center">Estado</TableCell>
                                        {esAdmin() && <TableCell align="center">Acciones</TableCell>}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {productosFiltrados.map((producto) => (
                                        <TableRow key={producto.id}>
                                            <TableCell>
                                                {producto.imagen ? (
                                                    <Box
                                                        component="img"
                                                        src={obtenerImagen(producto.imagen)}
                                                        alt={producto.nombre}
                                                        sx={{
                                                            width: 55,
                                                            height: 55,
                                                            objectFit: "cover",
                                                            borderRadius: 2,
                                                            border: "1px solid #eadce2",
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            width: 55,
                                                            height: 55,
                                                            borderRadius: 2,
                                                            bgcolor: "#fde8f0",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#d95a8e",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Sin foto
                                                    </Box>
                                                )}
                                            </TableCell>

                                            <TableCell>{producto.nombre}</TableCell>
                                            <TableCell>{producto.categoria}</TableCell>
                                            <TableCell>{producto.talla}</TableCell>
                                            <TableCell>{producto.color}</TableCell>
                                            <TableCell>${Number(producto.precio).toFixed(2)}</TableCell>
                                            <TableCell>{producto.stock}</TableCell>

                                            <TableCell align="center">{renderEstado(producto)}</TableCell>

                                            {esAdmin() && (
                                                <TableCell align="center">
                                                    <Tooltip title="Editar producto">
                                                        <IconButton onClick={() => editarProducto(producto)}>
                                                            <BorderColorIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Eliminar producto">
                                                        <IconButton onClick={() => eliminarProducto(producto.id)}>
                                                            <DeleteForeverIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={open} onClose={cerrarModal} maxWidth="sm" fullWidth>
                    <DialogTitle fontWeight={900} color="#cf5f8d">
                        {modoEdicion ? "Editar producto" : "Nuevo producto"}
                    </DialogTitle>

                    <DialogContent>
                        <TextField fullWidth label="Nombre del producto" name="nombre" margin="normal" value={form.nombre} onChange={handleChange} />
                        <TextField fullWidth label="Descripción" name="descripcion" margin="normal" value={form.descripcion} onChange={handleChange} />

                        <TextField select fullWidth label="Categoría" name="categoria_id" margin="normal" value={form.categoria_id} onChange={handleChange}>
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField fullWidth label="Talla" name="talla" margin="normal" value={form.talla} onChange={handleChange} placeholder="CH, M, G, XL, Unitalla" />
                        <TextField fullWidth label="Color" name="color" margin="normal" value={form.color} onChange={handleChange} />
                        <TextField fullWidth label="Precio" name="precio" type="number" margin="normal" value={form.precio} onChange={handleChange} inputProps={{ min: 0, step: "0.01" }} />
                        <TextField fullWidth label="Stock" name="stock" type="number" margin="normal" value={form.stock} onChange={handleChange} inputProps={{ min: 0, step: "1" }} />

                        <Box mt={2}>
                            <Typography fontWeight="bold" color="#cf5f8d" mb={1}>
                                Imagen del producto
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<ImageIcon />}
                                sx={{
                                    mb: 2,
                                    borderColor: "#d95a8e",
                                    color: "#d95a8e",
                                    borderRadius: 2,
                                    py: 1.2,
                                    fontWeight: "bold",
                                    "&:hover": { borderColor: "#cf4f82", bgcolor: "#fff7fa" },
                                }}
                            >
                                Seleccionar de galería
                                <input hidden type="file" accept="image/*" onChange={handleImagen} />
                            </Button>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PhotoCameraIcon />}
                                sx={{
                                    borderColor: "#d95a8e",
                                    color: "#d95a8e",
                                    borderRadius: 2,
                                    py: 1.2,
                                    fontWeight: "bold",
                                    "&:hover": { borderColor: "#cf4f82", bgcolor: "#fff7fa" },
                                }}
                            >
                                Tomar fotografía
                                <input hidden type="file" accept="image/*" capture="environment" onChange={handleImagen} />
                            </Button>

                            {preview && (
                                <Box mt={2} sx={{ textAlign: "center" }}>
                                    <Box
                                        component="img"
                                        src={preview}
                                        alt="Vista previa"
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            objectFit: "cover",
                                            borderRadius: 3,
                                            border: "1px solid #eadce2",
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={cerrarModal}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={guardarProducto}
                            sx={{
                                bgcolor: "#d95a8e",
                                "&:hover": { bgcolor: "#cf4f82" },
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

const resumenCard = {
    p: { xs: 1.5, md: 2.5 },
    borderRadius: 4,
    boxShadow: "0 12px 30px rgba(177,112,139,0.14)",
    bgcolor: "#fff",
};

export default Productos;
