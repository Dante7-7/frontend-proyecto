import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            // Ruta principal que redirige a landing
            path: '/',
            redirect: '/landing'
        },
        {
            // Ruta de la página de inicio (Landing)
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Principal.vue')
        },
        {
            // Ruta para el login
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            // Ruta principal después de iniciar sesión, con layout y las vistas hijas
            path: '/app',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                // Páginas dentro de la aplicación
                {
                    path: '/pages/crud',
                    name: 'programa',
                    component: () => import('@/views/pages/Programa.vue')
                },
                {
                    path: '/pages/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/pages/Usuario.vue')
                },
                {
                    path: '/pages/competencia',
                    name: 'competencia',
                    component: () => import('@/views/pages/Competencia.vue')
                },
                {
                    path: '/pages/resultado',
                    name: 'resultado',
                    component: () => import('@/views/pages/Resultado.vue')
                },
                {
                    path: '/pages/guias',
                    name: 'guias',
                    component: () => import('@/views/pages/Guia.vue')
                },
                {
                    path: '/pages/relacion_programa_competencia',
                    name: 'relacion_programa_competencia',
                    component: () => import('@/views/pages/Relacion_Programa_Competencia.vue')
                }
            ]
        },
        {
            // Ruta para página no encontrada
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
