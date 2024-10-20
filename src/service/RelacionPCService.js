import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getRelacion() {
        const response = await api.get('/programa');
        return response.data;
    },

    async getProgramas() {
        const response = await api.get('/programa');
        return response.data;
    },

    async getCompetencias() {
        const response = await api.get('/competencia');
        return response.data;
    },

    async saveRelacion(nuevaRelacion) {
        const response = await api.post('/programa/add-competencia', nuevaRelacion);
        return response.data;
    },

    async delete(relacion) {
        console.log('lo que llega', relacion);
        return await api.delete('/programa/eliminar-todas-relaciones', { data: relacion });
    }
};
