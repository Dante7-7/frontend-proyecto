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
        if (competencia.id) {
            // Si existe un id, actualiza el programa
            return api.put(`/competencia/${competencia.id}`, competencia);
        } else {
            // Si no existe un id, crea un nuevo programa
            return api.post('/competencia', competencia);
        }
    },

    deleteCompetencia(codigo) {
        return api.delete(`/competencia/${codigo}`);
    }
};
