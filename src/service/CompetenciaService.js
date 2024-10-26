import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

const token = localStorage.getItem('token');

export default {
    async getCompetencias() {
        const response = await api.get('/competencia');
        return response.data;
    },

    saveCompetencia(competencia) {
        return api.post('/competencia', competencia, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    updateCompetencia(competencia) {
        return api.patch(`/competencia/${competencia.Codigo}`, competencia, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    deleteCompetencia(codigo) {
        return api.delete(`/competencia/${codigo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
