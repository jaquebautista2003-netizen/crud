import {
    Box,
    Typography,
    Card,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { obtenerVentas, eliminarVenta } from "../services/ventas.service";

function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            const data = await obtenerVentas();
            setVentas(data);
        } catch (error) {
            console.log(error);
        }
    };

    const abrirEliminar = (venta) => {
        setVentaSeleccionada(venta);
        setOpen(true);
    };

    const confirmarEliminar = async () => {
        try {
            await eliminarVenta(ventaSeleccionada.id);
            setOpen(false);
            setVentaSeleccionada(null);
            cargarVentas();
        } catch (error) {
            console.log(error);
            alert("Error al eliminar venta");
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
                <Typography fontWeight={900} color="#cf5f8d" fontSize={38}>
                    Ventas
                </Typography>

                <Typography color="#777" mb={4}>
                    Historial de ventas realizadas
                </Typography>

                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        p: 2,
                        overflowX: "auto",
                        boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Folio</strong></TableCell>
                                <TableCell><strong>Fecha</strong></TableCell>
                                <TableCell><strong>Total</strong></TableCell>
                                <TableCell><strong>Método</strong></TableCell>
                                <TableCell><strong>Usuario</strong></TableCell>
                                <TableCell><strong>Acciones</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {ventas.map((venta) => (
                                <TableRow key={venta.id}>
                                    <TableCell>#{venta.id}</TableCell>

                                    <TableCell>
                                        {new Date(venta.fecha).toLocaleString("es-MX")}
                                    </TableCell>

                                    <TableCell>
                                        ${Number(venta.total || 0).toLocaleString()}
                                    </TableCell>

                                    <TableCell>{venta.metodo_pago}</TableCell>

                                    <TableCell>{venta.usuario || "Usuario"}</TableCell>

                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => abrirEliminar(venta)}
                                            sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 800,
                                            }}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {ventas.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay ventas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle fontWeight={900} color="#cf5f8d">
                    Eliminar venta
                </DialogTitle>

                <DialogContent>
                    ¿Seguro que deseas eliminar la venta #{ventaSeleccionada?.id}?
                    <br />
                    El stock de los productos vendidos se restaurará automáticamente.
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmarEliminar}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Ventas;