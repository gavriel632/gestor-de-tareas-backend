// Importa todas las funciones del modelo de tareas (tasks.model.js) para interactuar con Firestore.
import * as model from "../models/tasks.model.js";
// Importa el objeto Timestamp de Firebase para manejar correctamente las fechas y horas en Firestore.
import { Timestamp } from "firebase/firestore";

////////////////////////////////////////////////////
// 🔓 OBTENER TODAS LAS TAREAS (modo admin temporal) (GET /tasks)
////////////////////////////////////////////////////
// Función controladora para obtener todas las tareas.
// ⚠️ NOTA TEMPORAL: No incluye la validación de usuario logueado ni filtrado por ID de usuario.
export const getAllTasks = async (req, res) => {
    try {

        const userId = req.user.id;
        const tasks = await model.getAllTasksByUser(userId);
        // Responde con el array de tareas.
        res.json(tasks);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al obtener las tareas." });
    }
};

////////////////////////////////////////////////////
// 🔓 BUSCAR TAREAS POR TÍTULO (modo admin temporal) (GET /tasks/search?titulo=...)
////////////////////////////////////////////////////
// Función controladora para buscar tareas por el título.
// ⚠️ NOTA TEMPORAL: La búsqueda se realiza en todas las tareas, sin filtrar por usuario.
export const searchTask = async (req, res) => {
    try {
        const { titulo } = req.query;
        const userId = req.user.id;

        const tasks = await model.getAllTasksByUser(userId);

        // Filtra el array de tareas en memoria.
        const filteredTasks = tasks.filter(task =>
            // Busca coincidencias insensibles a mayúsculas/minúsculas.
            (task.titulo ?? "").toLowerCase().includes((titulo ?? "").toLowerCase())
        );

        // Responde con el subconjunto filtrado.
        res.json(filteredTasks);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al buscar tareas." });
    }
};

////////////////////////////////////////////////////
// 🔓 OBTENER TAREA POR ID (modo admin temporal) (GET /tasks/:id)
////////////////////////////////////////////////////
// Función controladora para obtener una tarea específica por su ID.
// ⚠️ NOTA TEMPORAL: No se valida si el usuario logueado es el dueño de la tarea.
export const getTaskById = async (req, res) => {
    try {
        // Obtiene el ID del parámetro de la ruta.
        const { id } = req.params;
        // Llama al modelo para buscar la tarea.
        const task = await model.getTaskById(id);

        // Si la tarea no se encuentra.
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

        if (task.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenes permiso para ver esta tarea" })
        }

        // Responde con el objeto tarea.
        res.json(task);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al obtener la tarea" });
    }
};

////////////////////////////////////////////////////
// CREAR TAREA (asociada al usuario logueado) (POST /tasks)
////////////////////////////////////////////////////
// Función controladora para crear una nueva tarea.
export const createTask = async (req, res) => {
    try {
        // ⚠️ MODO ADMIN TEMPORAL: El ID de usuario se establecerá con el middleware JWT en el futuro.
        // Mientras tanto, se asigna null o un ID de prueba si se requiere en el modelo.
        const userId = req.user.id;

        // Desestructura los datos del cuerpo de la solicitud.
        const { titulo, descripcion, estado, prioridad, fecha_vencimiento, id_categoria } = req.body;

        // Llama al modelo para guardar la nueva tarea, asignando valores predeterminados y Timestamps.
        const newTask = await model.createTask({
            titulo,
            descripcion,
            // Asigna valores predeterminados si no se proporcionan.
            estado: estado || "pendiente",
            prioridad: prioridad || "normal",
            // Establece la fecha de creación actual como Timestamp de Firestore.
            fecha_creacion: Timestamp.now(),
            // Convierte la cadena de fecha de vencimiento a Timestamp de Firestore (si existe).
            fecha_vencimiento: fecha_vencimiento ? Timestamp.fromDate(new Date(fecha_vencimiento)) : null,
            // Asigna IDs de categoría y usuario.
            id_categoria: id_categoria || null,
            id_usuario: userId
        });

        // Responde con un código 201 (Created) y la nueva tarea.
        res.status(201).json(newTask);
    } catch (error) {
        // Manejo de errores 500, incluyendo detalles en la consola.
        console.error("CREATE TASK ERROR:", error);
        res.status(500).json({ error: "Error al crear la tarea", detalle: error.message });
    }
};


////////////////////////////////////////////////////
// 🔓 ACTUALIZAR TAREA (modo admin temporal) (PUT/PATCH /tasks/:id)
////////////////////////////////////////////////////
// Función controladora para actualizar una tarea existente.
// ⚠️ NOTA TEMPORAL: No se valida si el usuario logueado es el dueño de la tarea.
export const updateTask = async (req, res) => {
    try {
        // Obtiene el ID del parámetro de la ruta.
        const { id } = req.params;
  
        const task = await model.getTaskById(id);

        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

        if (task.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenes permiso para actualizar esta tarea" })
        }

        const updated = await model.updateTask(id, req.body);

        res.json(updated);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al actualizar la tarea" });
    }
};

////////////////////////////////////////////////////
// 🔓 ELIMINAR TAREA (modo admin temporal) (DELETE /tasks/:id)
////////////////////////////////////////////////////
// Función controladora para eliminar una tarea.
// ⚠️ NOTA TEMPORAL: No se valida si el usuario logueado es el dueño de la tarea.
export const deleteTask = async (req, res) => {
    try {
        // Obtiene el ID del parámetro de la ruta.
        const { id } = req.params;

        const task = await model.getTaskById(id);
        // Llama al modelo para eliminar el documento.
        

        // Si la tarea no se encuentra.
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

        if (task.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenes permiso para eliminar esta tarea" })
        }
        // Responde con un código 204 (No Content).
        const deleted = await model.deleteTask(id);
        res.status(204).send();
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
};