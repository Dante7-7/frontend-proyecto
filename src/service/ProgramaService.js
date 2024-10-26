import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

const token = localStorage.getItem('token');

export default {
    async getProgramas() {
        const response = await api.get('/programa', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    savePrograma(programa) {
        return api.post('/programa', programa, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    update(programa) {
        return api.patch(`/programa/${programa.Codigo}`, programa, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    deletePrograma(codigo) {
        return api.delete(`/programa/${codigo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
