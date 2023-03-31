import { createApp } from 'vue'
import { createPinia, type Pinia } from "pinia";
import App from './App.vue'
import router from './router'

import './assets/main.css'
import { setupAuthStore } from "@/stores/auth";

//Create Pinia and store it globally:
const pinia = createPinia();
declare global {
	interface Window {
		__pinia: Pinia;
	}
}
Object.defineProperty(window, '__pinia', {
	value: pinia,
	writable: false,
});

//Create the Vue app:
const app = createApp(App)
app.use(pinia);
app.use(router)

//Initialize internal structure of the store (listeners etc):
setupAuthStore();

//Start the app:
app.mount('#app')
