import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                //pages

                {
                    path: '/pages/crud',
                    name: 'Programa',
                    component: () => import('@/views/pages/Programa.vue')
                },

                {
                    path: '/pages/usuarios',
                    name: 'usuaios',
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
            path: '/landing',
            name: 'logout',
            component: () => import('@/views/pages/Principal.vue')
            
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
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
