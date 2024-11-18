import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default {
    async getUsuarios(params = {}) {
        const query = new URLSearchParams();

        if (params.programaNombre) {
            query.append('programaNombre', params.programaNombre);
        }
        query.append('_', new Date().getTime());
        const token = localStorage.getItem('token');
        const response = await api.get(`/usuarios?${query.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('getusuarios', response);
        return response.data;
    },
    async createUsuario(data) {
        console.log('data:', data);
        const token = localStorage.getItem('token');
        return await api.post('/auth/register', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async updateUsuario(id, data) {
        console.log('data:', data, 'id:', id);
        console.log(data);
        const token = localStorage.getItem('token');
        return await api.patch(`/usuarios/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async deleteUsuario(id) {
        console.log('id usuario:', id);
        const token = localStorage.getItem('token');
        return await api.delete(`/usuarios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    async getRoles() {
        const token = localStorage.getItem('token');
        const response = await api.get('/roles', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('roles', response.data);
        return response.data;
    },
    async Login(data) {
        console.log('datos de login:', data);
        const response = await api.post('auth/login', data);
        console.log('lo que devuelve login:', response.data);
        return response.data;
    },

    async agregarCompetenciasAUsuario(id, data) {
        console.log('id', id, 'competencias:', data);
        const token = localStorage.getItem('token');
        const response = await api.post(
            `usuarios/${id}/competencias`,
            { competenciasIds: data },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log('add:', response.data);
        return response;
    },

    async eliminarCompetencia(id, competenciaID) {
        console.log(competenciaID, 'usuairoid', id);
        const token = localStorage.getItem('token');
        const reponse = await api.delete(`usuarios/${id}/competencias/${competenciaID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return reponse;
    },

    async recuperar_clave(email) {
        console.log('el correo', email);
        const reponse = await api.post('auth/restablecer-clave', { email: email });
        return reponse;
    },

    async guardar_nuevaclave(token, newPassword) {
        console.log('si llego', token, 'newpass', newPassword);
        const response = await api.post('auth/actualizar-clave', { token: token, newPassword: newPassword });
        return response.data;
    }
};
