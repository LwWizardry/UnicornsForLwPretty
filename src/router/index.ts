import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ModListView from '../views/ModListView.vue'
import LoginView from '../views/LoginView.vue'
import AccountView from '../views/AccountView.vue'
import AccountSettingsView from "@/views/AccountSettingsView.vue";
import AccountModsView from "@/views/AccountModsView.vue";

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
			children: [
				{
					path: '',
					name: 'account-settings',
					components: {
						default: AccountView,
						AccountViewer: AccountSettingsView,
					},
				},
				{
					path: 'mods',
					name: 'account-mods',
					components: {
						default: AccountView,
						AccountViewer: AccountModsView,
					},
				},
			]
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
		//Mod management routes:
		{
			path: '/new-mod',
			name: 'new-mod',
			component: () => import('../views/NewModView.vue'),
		},
		//Mod viewing routes:
		{
			path: '/mod/:modID',
			name: 'mod-details',
			component: () => import('../views/ModDetailView.vue'),
		},
		{
			path: '/mod/:modID/edit',
			name: 'mod-edit',
			component: () => import('../views/ModEditView.vue'),
		},
		{
			path: '/mod-direct/:modID',
			redirect: to => {
				return '/mod/' + to.params.modID;
			},
		},
	]
})

export default router
