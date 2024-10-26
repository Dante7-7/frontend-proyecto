import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

const token = localStorage.getItem('token');

export default {
    async getResultados() {
        const response = await api.get('/resultado', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    createResultado(resultado) {
        return api.post('/resultado', resultado, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Actualizar un resultado existente
    updateResultado(codigo, resultado) {
        return api.patch(`/resultado/${codigo}`, resultado, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    async getCompetencias() {
        try {
            const response = await api.get('/competencia', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener competencias:', error);
            throw error;
        }
    },
    deleteResultado(codigo) {
        return api.delete(`/resultado/${codigo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
