import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'primeicons/primeicons.css';

// Importar el tema de PrimeVue
import Aura from '@primevue/themes/aura';

// Importar PrimeVue y los componentes que necesitas
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Button from 'primevue/button';
import Card from 'primevue/card';
import FileUpload from 'primevue/fileupload';

// Importar estilos
import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);

// Usar el router
app.use(router);

// Configurar PrimeVue con el tema
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});

// Usar servicios de PrimeVue
app.use(ToastService);
app.use(ConfirmationService);

// Registrar componentes de PrimeVue
app.component('Button', Button);
app.component('Card', Card);
app.component('FileUpload', FileUpload);

// Montar la aplicación
app.mount('#app');
