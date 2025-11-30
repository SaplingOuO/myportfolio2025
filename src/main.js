import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { createPinia } from 'pinia'
import { gsap } from 'gsap'

const app = createApp(App);
app.use(gsap);
app.use(createPinia());
app.mount('#app');
