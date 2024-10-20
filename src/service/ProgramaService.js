import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getProgramas() {
        const response = await api.get('/programa');
        return response.data;
    },

    savePrograma(programa) {
        return api.post('/programa', programa);
    },

    update(programa) {
        return api.patch(`/programa/${programa.Codigo}`, programa);
    },

    deletePrograma(codigo) {
        return api.delete(`/programa/${codigo}`);
    }
};
