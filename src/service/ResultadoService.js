import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getResultados() {
        const response = await api.get('/resultado');
        return response.data;
    },

    saveResultado(resultado) {
        if (resultado.id) {
            // Si existe un id, actualiza
            return api.put(`/resultado/${resultado.id}`, resultado);
        } else {
            // Si no existe un id, crea uno nuevo
            return api.post('/resultado', resultado);
        }
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
