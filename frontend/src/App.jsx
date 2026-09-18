import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Caja from "./pages/Caja";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Ventas from "./pages/Ventas";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/caja" element={<Caja />} />
      <Route path="/ventas" element={<Ventas />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/usuarios" element={<Usuarios />} />
    </Routes>
  );
}

export default App;