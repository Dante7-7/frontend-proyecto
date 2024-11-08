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
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true, roles: ['Admin', 'Instructor', 'Coordinador'] }
                },

                // Páginas dentro de la aplicación
                {
                    path: '/pages/crud',
                    name: 'programa',
                    component: () => import('@/views/pages/Programa.vue'),
                    meta: { requiresAuth: true, roles: ['Admin'] }
                },
                {
                    path: '/pages/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/pages/Usuario.vue'),
                    meta: { requiresAuth: true, roles: ['Admin', 'Coordinador'] }
                },
                {
                    path: '/pages/competencia',
                    name: 'competencia',
                    component: () => import('@/views/pages/Competencia.vue'),
                    meta: { requiresAuth: true, roles: ['Admin'] }
                },
                {
                    path: '/pages/resultado',
                    name: 'resultado',
                    component: () => import('@/views/pages/Resultado.vue'),
                    meta: { requiresAuth: true, roles: ['Admin'] }
                },
                {
                    path: '/pages/guias',
                    name: 'guias',
                    component: () => import('@/views/pages/Guia.vue'),
                    meta: { requiresAuth: true, roles: ['Admin', 'Coordinador'] }
                },
                {
                    path: '/pages/relacion_programa_competencia',
                    name: 'relacion_programa_competencia',
                    component: () => import('@/views/pages/Relacion_Programa_Competencia.vue'),
                    meta: { requiresAuth: true, roles: ['Admin'] }
                }
            ]
        },
        {
            path: '/auth/restablecer_clave',
            name: 'RestablecerClave',
            component: () => import('@/views/pages/auth/Restablecer_Clave.vue')
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
        },
        {
            path: '/auth/Enviar_correo',
            name: 'EnviarCorreo',
            component: () => import('@/views/pages/auth/Enviar_correo.vue')
        }
    ]
});
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        next({ name: 'accessDenied' }); // Redirigir a acceso denegado si no tiene permiso
    } else {
        next();
    }
});

export default router;
