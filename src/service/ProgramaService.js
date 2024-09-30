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
        if (programa.id) {
            // Si existe un id, actualiza el programa
            return api.put(`/programa/${programa.id}`, programa);
        } else {
            // Si no existe un id, crea un nuevo programa
            return api.post('/programa', programa);
        }
    },

    deletePrograma(codigo) {
        return api.delete(`/programa/${codigo}`);
    }
};
