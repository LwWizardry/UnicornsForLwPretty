import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ModListView from '../views/ModListView.vue'
import LoginView from '../views/LoginView.vue'
import AccountView from '../views/AccountView.vue'

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
		{
			path: '/account',
			name: 'account',
			component: AccountView,
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
		//Mod viewing routes:
		{
			path: '/mod/:mod',
			name: 'mod-details',
			component: () => import('../views/ModDetailView.vue'),
		},
		{
			path: '/mod-direct/:mod',
			redirect: to => {
				return '/mod/' + to.params.mod;
			},
		},
	]
})

export default router
