import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getCompetencias() {
        const response = await api.get('/competencia');
        return response.data;
    },

    saveCompetencia(competencia) {
        return api.post('/competencia', competencia);
    },

    updateCompetencia(competencia) {
        return api.patch(`/competencia/${competencia.Codigo}`, competencia);
    },

    deleteCompetencia(codigo) {
        return api.delete(`/competencia/${codigo}`);
    }
};
