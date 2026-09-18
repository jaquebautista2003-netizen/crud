import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import logo from "../assets/logo.jpg";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ correo: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (data.usuario.rol === "cliente") {
        navigate("/cliente");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al iniciar sesión");
    }
  };

  return (
    <Box sx={fondo}>
      <Paper elevation={0} sx={card}>
        <Box component="img" src={logo} alt="Rosmeli" sx={logoStyle} />

        <Typography sx={titulo}>Bienvenida a Rosmeli</Typography>
        <Typography sx={subtitulo}>Inicia sesión para continuar</Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="correo"
            placeholder="Correo"
            value={form.correo}
            onChange={handleChange}
            sx={inputStyle}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={icono} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            name="password"
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            sx={inputStyle}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={icono} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={icono} />
                      ) : (
                        <VisibilityOutlinedIcon sx={icono} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button fullWidth type="submit" variant="contained" sx={boton}>
            ENTRAR
          </Button>
        </form>

        <Box sx={separador}>
          <Divider sx={{ flex: 1, borderColor: "#eadce2" }} />
          <FavoriteIcon sx={{ color: "#e88bab", fontSize: 18 }} />
          <Divider sx={{ flex: 1, borderColor: "#eadce2" }} />
        </Box>

        <Typography sx={version}>Rosmeli POS v1.0</Typography>
      </Paper>
    </Box>
  );
}

const fondo = {
  minHeight: "100vh",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, #fde8f0 0%, #fff7fa 38%, #ffffff 58%, #fde4ee 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: 2,
  py: 3,

  "&::before": {
    content: '""',
    position: "absolute",
    top: "-260px",
    left: "-170px",
    width: "650px",
    height: "430px",
    background: "rgba(232,142,176,0.42)",
    borderRadius: "0 0 90% 0",
    transform: "rotate(-8deg)",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-260px",
    right: "-210px",
    width: "720px",
    height: "430px",
    background: "rgba(232,142,176,0.42)",
    borderRadius: "90% 0 0 0",
    transform: "rotate(-10deg)",
  },
};

const card = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 440,
  px: 4,
  py: 4,
  borderRadius: "18px",
  backgroundColor: "#fff",
  boxShadow: "0 22px 50px rgba(177,112,139,0.24)",
};

const logoStyle = {
  display: "block",
  mx: "auto",
  width: "100%",
  height: 170,
  objectFit: "cover",
  borderRadius: "14px",
  mb: 2.6,
};

const titulo = {
  textAlign: "center",
  fontWeight: 900,
  color: "#cf5f8d",
  fontSize: 23,
  letterSpacing: "-0.4px",
};

const subtitulo = {
  textAlign: "center",
  color: "#777",
  mt: 0.7,
  mb: 3,
  fontSize: 14,
  fontWeight: 500,
};

const inputStyle = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    height: 55,
    borderRadius: "9px",
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#555",

    "& fieldset": {
      borderColor: "#eadce2",
      borderWidth: "1.3px",
    },

    "&:hover fieldset": {
      borderColor: "#e8a8c0",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#df7fa6",
    },
  },

  "& input::placeholder": {
    color: "#777",
    opacity: 0.9,
  },
};

const icono = {
  color: "#e47fa6",
  fontSize: 22,
};

const boton = {
  mt: 0.7,
  py: 1.45,
  borderRadius: "9px",
  background: "linear-gradient(90deg, #d95a8e, #e889ad)",
  color: "#fff",
  fontWeight: 900,
  fontSize: "0.95rem",
  textTransform: "uppercase",
  boxShadow: "0 13px 24px rgba(217,93,142,0.25)",

  "&:hover": {
    background: "linear-gradient(90deg, #cf4f82, #df7fa6)",
  },
};

const separador = {
  display: "flex",
  alignItems: "center",
  gap: 2.5,
  mt: 3,
};

const version = {
  textAlign: "center",
  mt: 2.3,
  color: "#df7fa6",
  fontSize: 13,
  fontWeight: 500,
};

export default Login;