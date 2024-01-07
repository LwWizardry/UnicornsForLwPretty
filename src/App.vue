<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from "@/stores/auth";
import WebsiteTitle from "@/components/WebsiteTitle.vue";

const authStore = useAuthStore();

const discordLink = import.meta.env.VITE_DISCORD_LINK;
const lwLink = import.meta.env.VITE_LOGICWORLD_LINK;
</script>

<template>
	<header>
		<div class="wrapper">
			<WebsiteTitle />
			
			<nav>
				<RouterLink to="/">Welcome</RouterLink>
				<RouterLink to="/mods">Mods</RouterLink>
				<RouterLink v-if="!authStore.isLoggedIn" to="/login">Login</RouterLink>
				<RouterLink v-if="authStore.currentUser" to="/account">Account ({{ authStore.currentUser.username }})</RouterLink>
				<a :href="discordLink" target="_blank">Discord🔗</a>
				<a :href="lwLink" target="_blank">Logic World🔗</a>
				<RouterLink to="/terms">Terms of Service</RouterLink>
				<RouterLink to="/privacy">Privacy Policy</RouterLink>
				<RouterLink to="/imprint">Imprint</RouterLink>
			</nav>
		</div>
	</header>
	
	<RouterView />
</template>

<style scoped>
header {
	line-height: 1.5;
	max-height: 100vh;
}

nav {
	width: 100%;
	font-size: 12px;
	text-align: center;
	margin-top: 2rem;
}

nav a.router-link-exact-active {
	color: var(--color-text);
}

nav a.router-link-exact-active:hover {
	background-color: transparent;
}

nav a {
	display: inline-block;
	padding: 0 1rem;
	border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
	border: 0;
}

@media (min-width: 1024px) {
	header {
		display: flex;
		place-items: center;
		padding-right: calc(var(--section-gap) / 2);
	}
	
	header .wrapper {
		display: flex;
		place-items: flex-start;
		flex-wrap: wrap;
	}
	
	nav {
		text-align: left;
		margin-left: -1rem;
		font-size: 1rem;
		
		padding: 1rem 0;
		margin-top: 1rem;
	}
}
</style>
