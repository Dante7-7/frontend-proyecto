import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getArchivos(usuarioId) {
        console.log('id:', usuarioId);
        const response = await api.get(`/archivos/usuario/${usuarioId}`);
        return response.data;
    },

    async getAllArchivos() {
        const response = await api.get('/archivos');
        console.log('datos archivos', response.data);
        return response.data;
    },

    uploadArchivo(formData) {
        return api.post(`/archivos/subir`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async saveArchivo(registroData) {
        console.log('data:', registroData);
        const response = await api.post('/archivos/guardar', registroData);
        return response.data;
    },

    updateArchivo(Codigo, formData) {
        return api.patch(`/archivos/${Codigo}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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
