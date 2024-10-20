import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getResultados() {
        const response = await api.get('/resultado');
        return response.data;
    },

    createResultado(resultado) {
        return api.post('/resultado', resultado);
    },

    // Actualizar un resultado existente
    updateResultado(codigo, resultado) {
        return api.patch(`/resultado/${codigo}`, resultado);
    },

    async getCompetencias() {
        try {
            const response = await api.get('/competencia');
            return response.data;
        } catch (error) {
            console.error('Error al obtener competencias:', error);
            throw error;
        }
    },
    deleteResultado(codigo) {
        return api.delete(`/resultado/${codigo}`);
    }
};
