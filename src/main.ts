import { createApp } from 'vue'
import { createPinia, type Pinia } from "pinia";
import App from './App.vue'
import router from './router'
import { MarkdownController } from './code/markdownController';

import './assets/main.css'
import { setupAuthStore } from "@/stores/auth";

//Create Pinia and store it globally:
const pinia = createPinia();
declare global {
	interface Window {
		__pinia: Pinia;
		__markdown: MarkdownController;
	}
}
Object.defineProperty(window, '__pinia', {
	value: pinia,
	writable: false,
});
Object.defineProperty(window, '__markdown', {
	value: new MarkdownController(),
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
