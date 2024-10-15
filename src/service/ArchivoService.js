import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getArchivos() {
        const response = await api.get('/archivos');
        return response.data;
    },

    saveArchivo(formData) {
        if (formData.has('file')) {
            const file = formData.get('file');
            console.log('Nombre del archivo:', file.name);
            console.log('Tipo de archivo:', file.type);
            console.log('Tamaño del archivo:', file.size);
        } else {
            console.log('No se encontró el archivo en el FormData.');
        }
        return api.post('/archivos', formData, {});
    },

    updateArchivo(id, formData) {
        return api.put(`/archivos/${id}`, formData, {
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
