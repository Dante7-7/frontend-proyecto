import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getArchivos() {
        const response = await api.get('/archivos');
        return response.data;
    },

    saveArchivo(archivo) {
        if (archivo.id) {
            // Si existe un id, actualiza el programa
            return api.put(`/archivos/${archivo.id}`, archivo);
        } else {
            // Si no existe un id, crea un nuevo programa
            return api.post('/archivos', archivo);
        }
    },

    deleteArchivo(codigo) {
        return api.delete(`/archivos/${codigo}`);
    },

    async getResultados() {
        try {
            const response = await api.get('/resultado');
            return response.data;
        } catch (error) {
            console.error('Error al obtener competencias:', error);
            throw error;
        }
    }
};
