// Importa la instancia de la base de datos (Firestore) inicializada en data.js.
import { db } from "../config/firebase.js";
// Importa las funciones del SDK de Firebase Firestore necesarias para todas las operaciones CRUD.
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

// 📌 Colección de Firestore
// Crea una referencia a la colección de Firestore llamada "categories" usando la instancia de la base de datos (db).
// Esta referencia se utiliza en todas las funciones para saber dónde buscar/guardar.
const categoriesCollection = collection(db, "categories");

//////////////////////////////////////////////
// 📍 Obtener TODAS las categorías (Read - All)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para recuperar todos los documentos de la colección 'categories'.
export const getAllCategories = async () => {
    try {
        // Ejecuta la consulta a Firestore y espera a obtener el 'snapshot' (una instantánea de la colección).
        const snapshot = await getDocs(categoriesCollection);
        // Mapea el array de documentos del snapshot a un array de objetos JavaScript.
        // d.id: Agrega el ID único de Firestore al objeto.
        // ...d.data(): Desempaqueta los campos del documento (nombre, color, etc.) en el objeto.
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        // Captura cualquier error ocurrido durante la lectura de la colección.
        console.error("getAllCategories error:", error);
        // Retorna un array vacío en caso de fallo para evitar errores en la capa de la aplicación.
        return [];
    }
};

//////////////////////////////////////////////
// 📍 Obtener categorías por Usuario (Consulta con filtro)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para obtener todas las categorías de un usuario específico.
export const getAllCategoriesByUser = async (userId) => {
    try {
        // Construye una consulta que filtra la colección 'categories'
        // buscando documentos donde el campo "id_usuario" sea igual al 'userId' proporcionado.
        const q = query(categoriesCollection, where("id_usuario", "==", userId));
        // Ejecuta la consulta filtrada y espera el snapshot.
        const snapshot = await getDocs(q);
        // Mapea y retorna el array de categorías que pertenecen a ese usuario.
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        // Captura y registra el error.
        console.error("getAllCategoriesByUser error:", error);
        // Retorna un array vacío en caso de fallo.
        return [];
    }
};

//////////////////////////////////////////////
// 📍 Obtener categoría por ID (Read - One)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para buscar una categoría específica por su ID.
export const getCategoryById = async (id) => {
    try {
        // Crea una referencia a un documento específico dentro de 'categoriesCollection' usando el 'id' proporcionado.
        const categoryRef = doc(categoriesCollection, id);
        // Espera a obtener el 'snapshot' (instantánea) de ese documento específico.
        const snapshot = await getDoc(categoryRef);
        
        // Verifica si el documento existe (snapshot.exists()).
        // Si existe, retorna el objeto con el ID y los datos; si no, retorna null.
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (error) {
        // Captura y registra cualquier error.
        console.error("getCategoryById error:", error);
        // Retorna null en caso de fallo.
        return null;
    }
};

//////////////////////////////////////////////
// 📍 Crear categoría (Create)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para añadir una nueva categoría a la base de datos.
export const createCategory = async (data) => {
    try {
        // Validación de entrada: asegura que se recibieron datos y que son un objeto válido.
        if (!data || typeof data !== "object") {
            throw new Error("Datos inválidos para crear categoría");
        }

        // Agrega un nuevo documento a la colección. Firestore genera automáticamente un ID.
        // 'docRef' contiene la referencia al documento recién creado.
        const docRef = await addDoc(categoriesCollection, data);
        // Retorna el ID generado por Firestore junto con los datos que se guardaron.
        return { id: docRef.id, ...data };
    } catch (error) {
        // Captura y registra el error.
        console.error("createCategory error:", error);
        // Lanza un nuevo error para manejarlo en el controlador.
        throw new Error("No se pudo crear la categoría");
    }
};

//////////////////////////////////////////////
// 📍 Actualizar categoría (Update)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para actualizar los datos de una categoría existente.
export const updateCategory = async (id, data) => {
    try {
        // Crea una referencia al documento específico que se va a actualizar.
        const categoryRef = doc(categoriesCollection, id);
        // Obtiene el estado actual del documento para verificar su existencia.
        const snapshot = await getDoc(categoryRef);

        // Si el documento no existe, retorna null.
        if (!snapshot.exists()) return null;

        // Aplica la actualización con los datos proporcionados al documento referenciado.
        await updateDoc(categoryRef, data);
        // Obtiene una nueva instantánea del documento para retornar los datos actualizados.
        const updatedSnap = await getDoc(categoryRef);

        // Retorna el objeto actualizado, incluyendo su ID y los datos frescos.
        return { id: updatedSnap.id, ...updatedSnap.data() };
    } catch (error) {
        // Captura y registra el error.
        console.error("updateCategory error:", error);
        // Retorna null en caso de fallo.
        return null;
    }
};

//////////////////////////////////////////////
// 📍 Eliminar categoría (Delete)
//////////////////////////////////////////////
// Define y exporta una función asíncrona para eliminar una categoría por su ID.
export const deleteCategory = async (id) => {
    try {
        // Crea una referencia al documento específico que se va a eliminar.
        const categoryRef = doc(categoriesCollection, id);
        // Verifica la existencia del documento.
        const snapshot = await getDoc(categoryRef);

        // Si el documento no existe, retorna null.
        if (!snapshot.exists()) return null;

        // Elimina el documento de Firestore.
        await deleteDoc(categoryRef);
        // Retorna un objeto confirmando la eliminación y el ID.
        return { deleted: true, id };
    } catch (error) {
        // Captura y registra el error.
        console.error("deleteCategory error:", error);
        // Retorna un objeto indicando que no se eliminó debido a un error.
        return { deleted: false };
    }
};