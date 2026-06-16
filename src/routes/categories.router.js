import { Router } from "express"; // Desestructuramos Router de Express para utilizarlo

const router = Router(); // Es una instancia del Router

// Importa el middleware de autenticación para proteger las rutas.
import { validarToken } from '../middleware/auth.middleware.js';

//////////////////////////////////////////////
import {
    getAllCategories,
    getCategoryById,
    searchCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categories.controller.js"

//////////////////////////////////////////////

/// Rutas (todas protegidas con validarToken) ///
router.get('/categories', validarToken, getAllCategories);
router.get('/categories/search', validarToken, searchCategory);
router.get('/categories/:id', validarToken, getCategoryById);
router.post('/categories', validarToken, createCategory);
router.put('/categories/:id', validarToken, updateCategory);
router.delete('/categories/:id', validarToken, deleteCategory);

//////////////////////////////////////////////
export default router;