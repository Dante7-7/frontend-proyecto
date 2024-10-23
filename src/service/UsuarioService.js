import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getUsuarios() {
        const response = await api.get('/usuarios');
        return response.data;
    },
    async createUsuario(data) {
        console.log('data:', data);
        return await api.post('/auth/register', data);
    },
    async updateUsuario(id, data) {
        const response = await api.patch(`/usuarios/${id}`, data);
        console.log('data:', data, 'id:', id);
        return response;
    },
    async deleteUsuario(id) {
        console.log('id:', id);
        return await api.delete(`/usuarios/${id}`);
    },
    async getRoles() {
        const response = await api.get('/roles');
        return response.data;
    },
    async Login(data) {
        console.log('datos de login:', data);
        const response = await api.post('auth/login', data);
        return response;
    }
};
