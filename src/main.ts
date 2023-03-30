import { createApp } from 'vue'
import { createPinia } from "pinia";
import App from './App.vue'
import router from './router'

import './assets/main.css'
import { setupAuthStore } from "@/stores/auth";

const pinia = createPinia();
const app = createApp(App)

app.use(pinia);
app.use(router)

setupAuthStore();

app.mount('#app')
