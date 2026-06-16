// Importa todas las funciones del modelo de categorías para interactuar con Firestore.
import * as model from "../models/categories.model.js";

////////////////////////////////////////////////////
// 📌 OBTENER TODAS LAS CATEGORÍAS DEL USUARIO (GET /categories)
////////////////////////////////////////////////////
// Función controladora para obtener solo las categorías del usuario autenticado.
export const getAllCategories = async (req, res) => {
    try {
        // Extrae el ID del usuario desde el token JWT (asignado por el middleware validarToken).
        const userId = req.user.id;
        // Llama a la función del modelo que filtra por id_usuario.
        const categories = await model.getAllCategoriesByUser(userId);
        // Responde con un código 200 (OK) y el array de categorías en formato JSON.
        res.json(categories);
    } catch (error) {
        // Registra el error interno y responde con un código 500 (Internal Server Error).
        res.status(500).json({ error: "Error al obtener las categorías" });
    }
};

////////////////////////////////////////////////////
// 🔍 BUSCAR CATEGORÍAS POR NOMBRE (GET /categories/search?nombre=...)
////////////////////////////////////////////////////
// Función controladora para filtrar las categorías del usuario por un término de búsqueda en el nombre.
export const searchCategory = async (req, res) => {
    try {
        // Obtiene el parámetro de consulta 'nombre' de la URL (ej: ?nombre=Trabajo).
        const { nombre } = req.query;
        // Extrae el ID del usuario autenticado.
        const userId = req.user.id;
        // Trae solo las categorías del usuario y luego filtra en memoria.
        const categories = await model.getAllCategoriesByUser(userId);

        // Filtra el array de categorías del usuario.
        const filteredCategories = categories.filter(cat =>
            // Asegura que 'nombre' no sea nulo/undefined, convierte a minúsculas, y busca el término.
            (cat.nombre ?? "").toLowerCase().includes((nombre ?? "").toLowerCase())
        );

        // Responde con el subconjunto filtrado de categorías.
        res.json(filteredCategories);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al buscar categorías" });
    }
};

////////////////////////////////////////////////////
// 📌 OBTENER CATEGORÍA POR ID (GET /categories/:id)
////////////////////////////////////////////////////
// Función controladora para obtener una categoría por su ID único.
// Verifica que la categoría pertenezca al usuario autenticado.
export const getCategoryById = async (req, res) => {
    try {
        // Obtiene el parámetro 'id' de la ruta de la URL (ej: /categories/abc1234).
        const { id } = req.params;
        // Llama al modelo para buscar la categoría.
        const category = await model.getCategoryById(id);

        // Si el modelo retorna null (categoría no encontrada).
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

        // Verifica que la categoría pertenezca al usuario autenticado.
        if (category.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenés permiso para ver esta categoría" });
        }

        // Responde con el objeto categoría.
        res.json(category);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al obtener categoría" });
    }
};

////////////////////////////////////////////////////
// ➕ CREAR CATEGORÍA (POST /categories)
////////////////////////////////////////////////////
// Función controladora para manejar la creación de una nueva categoría.
// Asocia la categoría al usuario autenticado mediante id_usuario.
export const createCategory = async (req, res) => {
    try {
        // Obtiene los datos de la nueva categoría del cuerpo de la solicitud.
        const { nombre, color, icono } = req.body;
        // Extrae el ID del usuario autenticado desde el token JWT.
        const userId = req.user.id;

        // Validación de datos: El nombre es obligatorio.
        if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

        // Llama al modelo para guardar la nueva categoría en Firestore,
        // incluyendo el id_usuario para asociarla al usuario creador.
        const newCategory = await model.createCategory({ nombre, color, icono, id_usuario: userId });
        // Responde con un código 201 (Created) y el objeto de la nueva categoría (incluyendo su nuevo ID).
        res.status(201).json(newCategory);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al crear la categoría" });
    }
};

////////////////////////////////////////////////////
// ✏️ ACTUALIZAR CATEGORÍA (PUT/PATCH /categories/:id)
////////////////////////////////////////////////////
// Función controladora para actualizar una categoría existente.
// Verifica que la categoría pertenezca al usuario autenticado antes de actualizar.
export const updateCategory = async (req, res) => {
    try {
        // Obtiene el ID del parámetro de la ruta.
        const { id } = req.params;
        // Busca la categoría primero para verificar existencia y propiedad.
        const category = await model.getCategoryById(id);

        // Si el modelo retorna null (categoría no encontrada).
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

        // Verifica que la categoría pertenezca al usuario autenticado.
        if (category.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenés permiso para actualizar esta categoría" });
        }

        // Llama al modelo para actualizar el documento con los datos del cuerpo (req.body).
        const updated = await model.updateCategory(id, req.body);

        // Responde con el objeto categoría ya actualizado.
        res.json(updated);
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al actualizar la categoría" });
    }
};

////////////////////////////////////////////////////
// 🗑️ ELIMINAR CATEGORÍA (DELETE /categories/:id)
////////////////////////////////////////////////////
// Función controladora para eliminar una categoría.
// Verifica que la categoría pertenezca al usuario autenticado antes de eliminar.
export const deleteCategory = async (req, res) => {
    try {
        // Obtiene el ID del parámetro de la ruta.
        const { id } = req.params;
        // Busca la categoría primero para verificar existencia y propiedad.
        const category = await model.getCategoryById(id);

        // Si el modelo retorna null (categoría no encontrada).
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

        // Verifica que la categoría pertenezca al usuario autenticado.
        if (category.id_usuario !== req.user.id) {
            return res.status(403).json({ error: "No tenés permiso para eliminar esta categoría" });
        }

        // Llama al modelo para eliminar el documento.
        await model.deleteCategory(id);
        // Responde con un código 204 (No Content), indicando que la eliminación fue exitosa.
        res.status(204).send();
    } catch (error) {
        // Manejo de errores 500.
        res.status(500).json({ error: "Error al eliminar la categoría" });
    }
};