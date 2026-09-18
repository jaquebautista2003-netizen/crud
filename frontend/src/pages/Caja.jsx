import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    IconButton,
    Divider,
    Dialog,
    Badge,
    Drawer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Sidebar from "../components/Sidebar";
import { useEffect, useState, useRef } from "react";
import { getProductos } from "../services/productos.service";
import { crearVenta } from "../services/ventas.service";
import CloseIcon from "@mui/icons-material/Close";
import { useReactToPrint } from "react-to-print";
import logo from "../assets/Logo.png";

function Caja() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [imagenAbierta, setImagenAbierta] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [openCarrito, setOpenCarrito] = useState(false);
    const [openTicket, setOpenTicket] = useState(false);
    const [ticket, setTicket] = useState(null);

    const ticketRef = useRef();

    const imprimirTicket = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket_Rosmeli_${ticket?.venta_id || ""}`,
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await getProductos();
            setProductos(data);
        } catch (error) {
            console.log(error);
        }
    };

    const obtenerImagen = (imagen) => {
        if (!imagen) return null;
        if (imagen.startsWith("http")) return imagen;
        return `http://localhost:3000${imagen}`;
    };

    const abrirImagen = (imagen) => {
        setImagenSeleccionada(obtenerImagen(imagen));
        setImagenAbierta(true);
    };

    const agregarAlCarrito = (producto) => {
        if (Number(producto.stock) <= 0) {
            alert("Producto agotado");
            return;
        }

        const existe = carrito.find((item) => item.id === producto.id);

        if (existe) {
            if (existe.cantidad >= Number(producto.stock)) {
                alert("No hay suficiente stock");
                return;
            }

            setCarrito(
                carrito.map((item) =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            );
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    const aumentarCantidad = (id) => {
        setCarrito(
            carrito.map((item) => {
                if (item.id === id) {
                    if (item.cantidad >= Number(item.stock)) {
                        alert("No hay suficiente stock");
                        return item;
                    }
                    return { ...item, cantidad: item.cantidad + 1 };
                }
                return item;
            })
        );
    };

    const disminuirCantidad = (id) => {
        setCarrito(
            carrito
                .map((item) =>
                    item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
                )
                .filter((item) => item.cantidad > 0)
        );
    };

    const quitarDelCarrito = (id) => {
        setCarrito(carrito.filter((item) => item.id !== id));
    };

    const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const total = carrito.reduce(
        (acc, item) => acc + Number(item.precio) * item.cantidad,
        0
    );

    const cobrarVenta = async () => {
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));

            const venta = {
                usuario_id: usuario.id,
                metodo_pago: "efectivo",
                productos: carrito,
            };

            const respuesta = await crearVenta(venta);

            setTicket({
                venta_id: respuesta.venta_id,
                total: respuesta.total,
                fecha: new Date().toLocaleString("es-MX"),
                productos: carrito,
            });

            setOpenTicket(true);
            setOpenCarrito(false);
            setCarrito([]);
            await cargarProductos();

            alert(`Venta realizada correctamente\nTotal: $${respuesta.total}`);
        } catch (error) {
            console.log(error);

            alert(error.response?.data?.mensaje || "Error al realizar venta");
        }
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
                        alignItems: "center",
                        mb: { xs: 2, md: 4 },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            fontWeight={900}
                            color="#cf5f8d"
                            sx={{
                                fontSize: { xs: 28, md: 34 },
                                lineHeight: 1.2,
                            }}
                        >
                            Punto de Venta
                        </Typography>

                        <Typography color="#777" sx={{ fontSize: { xs: 13, md: 16 } }}>
                            Registra ventas y genera tickets
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={() => setOpenCarrito(true)}
                        sx={{
                            bgcolor: "#fff",
                            width: { xs: 48, md: 56 },
                            height: { xs: 48, md: 56 },
                            boxShadow: "0 8px 20px rgba(177,112,139,0.18)",
                            "&:hover": {
                                bgcolor: "#fde8f0",
                            },
                        }}
                    >
                        <Badge badgeContent={totalCantidad} color="error">
                            <ShoppingCartIcon
                                sx={{ color: "#d95a8e", fontSize: { xs: 26, md: 30 } }}
                            />
                        </Badge>
                    </IconButton>
                </Box>

                <Card elevation={0} sx={cardStyle}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Typography fontWeight={900} color="#cf5f8d" mb={2}>
                            Productos disponibles
                        </Typography>

                        <Grid
                            container
                            spacing={2}
                            sx={{
                                display: {
                                    xs: "flex",
                                    md: "grid",
                                },
                                gridTemplateColumns: {
                                    md: "repeat(5, minmax(0, 1fr))",
                                },
                                overflowX: {
                                    xs: "auto",
                                    md: "visible",
                                },
                                flexWrap: {
                                    xs: "nowrap",
                                    md: "wrap",
                                },
                                pb: {
                                    xs: 2,
                                    md: 0,
                                },
                                scrollSnapType: {
                                    xs: "x mandatory",
                                    md: "none",
                                },
                                "&::-webkit-scrollbar": {
                                    height: 6,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: "#d95a8e",
                                    borderRadius: 10,
                                },
                            }}
                        >
                            {productos.map((producto) => (
                                <Box
                                    key={producto.id}
                                    sx={{
                                        minWidth: {
                                            xs: 155,
                                            sm: 175,
                                            md: "auto",
                                        },
                                        width: {
                                            xs: 155,
                                            sm: 175,
                                            md: "100%",
                                        },
                                        flexShrink: 0,
                                        scrollSnapAlign: "start",
                                    }}
                                >
                                    <Card elevation={0} sx={productoCard}>
                                        {producto.imagen ? (
                                            <Box
                                                component="img"
                                                src={obtenerImagen(producto.imagen)}
                                                alt={producto.nombre}
                                                onClick={() => abrirImagen(producto.imagen)}
                                                sx={{
                                                    width: "100%",
                                                    height: { xs: 95, sm: 110, md: 150 },
                                                    objectFit: "cover",
                                                    borderRadius: 3,
                                                    mb: 1,
                                                    cursor: "pointer",
                                                }}
                                            />
                                        ) : (
                                            <Box sx={sinFoto}>Sin foto</Box>
                                        )}

                                        <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                                            <Typography
                                                fontWeight={900}
                                                noWrap
                                                sx={{
                                                    fontSize: { xs: 13, md: 16 },
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {producto.nombre}
                                            </Typography>

                                            <Typography
                                                color="#777"
                                                noWrap
                                                sx={{ fontSize: { xs: 11, md: 14 } }}
                                            >
                                                {producto.categoria}
                                            </Typography>

                                            <Typography
                                                mt={0.5}
                                                fontWeight={900}
                                                color="#cf5f8d"
                                                sx={{ fontSize: { xs: 15, md: 18 } }}
                                            >
                                                ${Number(producto.precio).toFixed(2)}
                                            </Typography>

                                            <Typography
                                                sx={{ fontSize: { xs: 11, md: 14 } }}
                                                color={
                                                    Number(producto.stock) <= 0
                                                        ? "error.main"
                                                        : Number(producto.stock) <= 5
                                                            ? "warning.main"
                                                            : "success.main"
                                                }
                                            >
                                                Stock: {producto.stock}
                                            </Typography>

                                            <Button
                                                fullWidth
                                                startIcon={<ShoppingCartIcon />}
                                                disabled={Number(producto.stock) <= 0}
                                                onClick={() => agregarAlCarrito(producto)}
                                                sx={botonAgregar}
                                            >
                                                Agregar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            <Drawer
                anchor="right"
                open={openCarrito}
                onClose={() => setOpenCarrito(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: {
                            xs: "100%",
                            sm: 380,
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        width: { xs: "100vw", sm: 380 },
                        maxWidth: "100vw",
                        p: { xs: 3, sm: 3 },
                        bgcolor: "#fff7fa",
                        minHeight: "100vh",
                        boxSizing: "border-box",
                        overflowX: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h5" fontWeight={900} color="#cf5f8d">
                            Carrito
                        </Typography>

                        <IconButton onClick={() => setOpenCarrito(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {carrito.length === 0 ? (
                        <Typography color="#999">No hay productos</Typography>
                    ) : (
                        carrito.map((item) => (
                            <Box key={item.id} sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 1,
                                    }}
                                >
                                    <Box>
                                        <Typography fontWeight={700}>{item.nombre}</Typography>
                                        <Typography color="#777" fontSize={14}>
                                            ${Number(item.precio).toFixed(2)} c/u
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        onClick={() => quitarDelCarrito(item.id)}
                                        sx={{ color: "#e53935" }}
                                    >
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mt: 1,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => disminuirCantidad(item.id)}
                                        sx={cantidadBtn}
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>

                                    <Typography fontWeight={800}>{item.cantidad}</Typography>

                                    <IconButton
                                        size="small"
                                        onClick={() => aumentarCantidad(item.id)}
                                        sx={cantidadBtn}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>

                                    <Typography ml="auto" fontWeight={800} color="#cf5f8d">
                                        ${(Number(item.precio) * item.cantidad).toFixed(2)}
                                    </Typography>
                                </Box>

                                <Divider sx={{ mt: 2 }} />
                            </Box>
                        ))
                    )}

                    <Typography mt={3} fontWeight={900} fontSize={22}>
                        Total: ${total.toFixed(2)}
                    </Typography>

                    <Button
                        fullWidth
                        disabled={carrito.length === 0}
                        onClick={cobrarVenta}
                        sx={botonCobrar}
                    >
                        Cobrar
                    </Button>
                </Box>
            </Drawer>

            <Dialog
                open={imagenAbierta}
                onClose={() => setImagenAbierta(false)}
                maxWidth="md"
                fullWidth
            >
                <Box sx={{ p: 2, bgcolor: "#fff7fa" }}>
                    {imagenSeleccionada && (
                        <Box
                            component="img"
                            src={imagenSeleccionada}
                            alt="Producto"
                            sx={{
                                width: "100%",
                                maxHeight: "80vh",
                                objectFit: "contain",
                                borderRadius: 3,
                            }}
                        />
                    )}
                </Box>
            </Dialog>

            <Dialog
                open={openTicket}
                onClose={() => setOpenTicket(false)}
                maxWidth="xs"
                fullWidth
            >
                <Box sx={{ p: 3, bgcolor: "#fff" }}>
                    <Box ref={ticketRef} sx={{ p: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mb: 2,
                            }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="Rosmeli"
                                sx={{
                                    width: 220,
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </Box>

                        <Typography
                            fontWeight={900}
                            color="#cf5f8d"
                            fontSize={24}
                            sx={{ textAlign: "center" }}
                        >
                            ROSMELI
                        </Typography>

                        <Typography color="#777" sx={{ textAlign: "center" }}>
                            Ticket de venta
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={700}>Venta #{ticket?.venta_id}</Typography>

                        <Typography color="#777" fontSize={14}>
                            Fecha: {ticket?.fecha}
                        </Typography>

                        <Typography color="#777" fontSize={14}>
                            Método de pago: Efectivo
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {ticket?.productos?.map((item) => (
                            <Box key={item.id} sx={{ mb: 1.5 }}>
                                <Typography fontWeight={700}>{item.nombre}</Typography>

                                <Typography fontSize={14} color="#777">
                                    {item.cantidad} x ${Number(item.precio).toFixed(2)}
                                </Typography>

                                <Typography fontWeight={700} sx={{ textAlign: "right" }}>
                                    ${(Number(item.precio) * item.cantidad).toFixed(2)}
                                </Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={900} fontSize={22} sx={{ textAlign: "right" }}>
                            Total: ${Number(ticket?.total || 0).toFixed(2)}
                        </Typography>

                        <Typography color="#777" mt={3} sx={{ textAlign: "center" }}>
                            Gracias por su compra 💖
                        </Typography>

                        <Typography color="#cf5f8d" fontSize={13} mt={1} sx={{ textAlign: "center" }}>
                            Rosmeli POS
                        </Typography>
                    </Box>

                    <Button
                        fullWidth
                        onClick={imprimirTicket}
                        sx={{
                            mt: 3,
                            bgcolor: "#d95a8e",
                            color: "#fff",
                            fontWeight: 900,
                            "&:hover": { bgcolor: "#cf4f82" },
                        }}
                    >
                        Imprimir ticket
                    </Button>

                    <Button fullWidth sx={{ mt: 1 }} onClick={() => setOpenTicket(false)}>
                        Cerrar
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}

const cardStyle = {
    borderRadius: 4,
    boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
};

const productoCard = {
    borderRadius: { xs: 3, md: 4 },
    height: "100%",
    p: { xs: 0.7, md: 1 },
    boxShadow: "0 8px 20px rgba(177,112,139,0.14)",
};

const sinFoto = {
    height: { xs: 95, sm: 110, md: 150 },
    bgcolor: "#f8dfe8",
    borderRadius: 3,
    mb: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cf5f8d",
    fontWeight: 700,
};

const botonAgregar = {
    mt: 1,
    py: { xs: 0.6, md: 1 },
    bgcolor: "#d95a8e",
    color: "#fff",
    borderRadius: 3,
    fontWeight: 800,
    fontSize: { xs: 10, md: 14 },
    "& .MuiButton-startIcon": {
        mr: { xs: 0.5, md: 1 },
    },
    "&:hover": {
        bgcolor: "#cf4f82",
    },
    "&:disabled": {
        bgcolor: "#f3c6d8",
        color: "#fff",
    },
};

const botonCobrar = {
    mt: 3,
    py: 1.4,
    bgcolor: "#d95a8e",
    color: "#fff",
    borderRadius: 3,
    fontWeight: 900,
    "&:hover": {
        bgcolor: "#cf4f82",
    },
    "&:disabled": {
        bgcolor: "#f3c6d8",
        color: "#fff",
    },
};

const cantidadBtn = {
    bgcolor: "#fde8f0",
    color: "#cf5f8d",
    "&:hover": {
        bgcolor: "#f8d5e3",
    },
};

export default Caja;
