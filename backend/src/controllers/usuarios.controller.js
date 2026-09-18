const db = require("../config/db");
const bcrypt = require("bcryptjs");

const obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
      SELECT id, nombre, correo, rol, fecha_registro
      FROM usuarios
      ORDER BY id DESC
    `);

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener usuarios",
            error: error.message,
        });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password || !rol) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO usuarios (nombre, correo, password, rol)
       VALUES (?, ?, ?, ?)`,
            [nombre, correo, passwordHash, rol]
        );

        res.status(201).json({
            mensaje: "Usuario creado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear usuario",
            error: error.message,
        });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !rol) {
            return res.status(400).json({
                mensaje: "Nombre, correo y rol son obligatorios",
            });
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);

            await db.query(
                `UPDATE usuarios
         SET nombre = ?, correo = ?, password = ?, rol = ?
         WHERE id = ?`,
                [nombre, correo, passwordHash, rol, id]
            );
        } else {
            await db.query(
                `UPDATE usuarios
         SET nombre = ?, correo = ?, rol = ?
         WHERE id = ?`,
                [nombre, correo, rol, id]
            );
        }

        res.json({
            mensaje: "Usuario actualizado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar usuario",
            error: error.message,
        });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

        res.json({
            mensaje: "Usuario eliminado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar usuario",
            error: error.message,
        });
    }
};

const registrarCliente = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                mensaje: "Nombre, correo y contraseña son obligatorios",
            });
        }

        const [existe] = await db.query(
            "SELECT id FROM usuarios WHERE correo = ?",
            [correo]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO usuarios (nombre, correo, password, rol)
       VALUES (?, ?, ?, 'cliente')`,
            [nombre, correo, passwordHash]
        );

        res.status(201).json({
            mensaje: "Cliente registrado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar cliente",
            error: error.message,
        });
    }
};
module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    registrarCliente,
};