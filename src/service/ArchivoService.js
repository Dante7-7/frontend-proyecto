import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

const token = localStorage.getItem('token');

export default {
    async getAllArchivos() {
        const response = await api.get('/archivos');
        console.log('datos archivos', response.data);
        return response.data;
    },

    async getArchivos(usuarioId) {
        console.log('id:', usuarioId);
        const response = await api.get(`/archivos/usuario/${usuarioId}`);
        console.log('archivos filtrados :', response.data);
        return response.data.archivos;
    },

    uploadArchivo(formData) {
        return api.post(`/archivos/subir`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
    },

    async saveArchivo(registroData) {
        console.log('data:', registroData);
        const response = await api.post('/archivos/guardar', registroData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    updateArchivo(Codigo, formData) {
        return api.patch(`/archivos/${Codigo}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
    },

    deleteArchivo(codigo) {
        return api.delete(`/archivos/${codigo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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
