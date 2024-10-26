import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});
const token = localStorage.getItem('token');

export default {
    async getRelacion() {
        const response = await api.get('/programa', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    async getCompetencias() {
        const response = await api.get('/competencia', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    async saveRelacion(nuevaRelacion) {
        const response = await api.post('/programa/add-competencia', nuevaRelacion, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    async delete(relacion) {
        console.log('lo que llega', relacion);
        return await api.delete(
            '/programa/eliminar-todas-relaciones',
            { data: relacion },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }
};
