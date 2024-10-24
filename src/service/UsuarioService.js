import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});
const token = localStorage.getItem('token');

export default {
    async getUsuarios() {
        const response = await api.get('/usuarios');
        return response.data;
    },
    async createUsuario(data) {
        console.log('data:', data);
        return await api.post('/auth/register', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async updateUsuario(id, data) {
        console.log('data:', data, 'id:', id);

        // const dataUpdate = {
        //     name: data.name,
        //     email: data.email,
        //     telefono: data.telefono,
        //     cedula: data.cedula
        // };
        console.log(data);
        return await api.patch(`/usuarios/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async deleteUsuario(id) {
        console.log('id:', id);
        return await api.delete(`/usuarios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async getRoles() {
        const response = await api.get('/roles');
        return response.data;
    },
    async Login(data) {
        console.log('datos de login:', data);
        const response = await api.post('auth/login', data);
        console.log('lo que devuelve login:', response.data);
        return response.data;
    }
};
