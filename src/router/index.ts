import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ModListView from '../views/ModListView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('../views/AboutView.vue')
		},
		{
			path: '/mods',
			name: 'mods',
			component: ModListView,
		},
		{
			path: '/login',
			name: 'login',
			component: LoginView,
		},
		//Legal routes:
		{
			path: '/terms',
			name: 'terms of service',
			component: () => import('../views/TermsView.vue'),
		},
		{
			path: '/privacy',
			name: 'privacy policy',
			component: () => import('../views/PrivacyView.vue'),
		},
		{
			path: '/imprint',
			name: 'imprint',
			component: () => import('../views/ImprintView.vue'),
		},
	]
})

export default router
