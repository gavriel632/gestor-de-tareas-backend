import { Router } from "express"; // Desestructuramos Router de Expres para utilizarlo

const router = Router(); // Es una instancia del Router

import { validarToken } from '../middleware/auth.middleware.js';
//////////////////////////////////////////////
import {
    getAllTasks,
    getTaskById,
    searchTask,
    createTask,
    updateTask,
    deleteTask
} from "../controllers/tasks.controller.js"

//////////////////////////////////////////////

/// Rutas ///
router.get('/tasks', validarToken, getAllTasks);
router.get('/tasks/search', validarToken, searchTask);
router.get('/tasks/:id', validarToken, getTaskById);
router.post('/tasks', validarToken, createTask);
router.put('/tasks/:id', validarToken, updateTask);
router.delete('/tasks/:id', validarToken, deleteTask);

//////////////////////////////////////////////
export default router;