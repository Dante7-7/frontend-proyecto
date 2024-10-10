import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getRelacion() {
        const response = await api.get('/programa');
        console.log('lo que tiene respose', response);
        return response.data;
    },

    async getProgramas() {
        const response = await api.get('/programa');
        console.log('lo que tiene programa', response);
        return response.data;
    },

    async getCompetencias() {
        const response = await api.get('/competencia');
        console.log('lo que tiene competencia', response);
        return response.data;
    },

    async saveRelacion(nuevaRelacion) {
        const response = await api.post('/programa/add-competencia', nuevaRelacion);
        console.log('lo que tiene relacion-crear', response);
        return response.data;
    }
};
