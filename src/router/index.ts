import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'welcome',
			component: () => import('../views/WelcomeView.vue')
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
			component: () => import('../views/ModListView.vue'),
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/LoginView.vue'),
		},
		{
			path: '/account',
			name: 'account',
			component: () => import('../views/AccountView.vue'),
			children: [
				{
					path: '',
					name: 'account-settings',
					component: () => import('../views/AccountSettingsView.vue'),
				},
				{
					path: 'mods',
					name: 'account-mods',
					component: () => import('../views/AccountModsView.vue'),
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
