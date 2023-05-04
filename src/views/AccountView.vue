<template>
	<div v-if="authStore.isLoggedIn">
		<header>
			<nav>
				<RouterLink :to="{name: 'account-settings'}">Settings</RouterLink>
				<RouterLink :to="{name: 'account-mods'}">Your mods</RouterLink>
			</nav>
		</header>
		
		<router-view />
	</div>
	<p v-else><RouterLink :to="{name: 'login'}">Login first...</RouterLink></p>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore()
</script>

<style scoped>
/* Basically copied the style from App.vue, TODO: Refactor this! */
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