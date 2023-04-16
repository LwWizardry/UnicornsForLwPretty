<template>
	<br/>
	<div v-if="authStore.currentUser">
		<p>Logged in as <span class="green">{{ authStore.currentUser.username }}</span></p>
		
		<br/>
		
		<p>Stop the current session.</p>
		<button @click="authStore.currentUser = null" class="custom-button-style">Logout</button>
		
		<br/><br/>
		
		<p>You can list every mod or comment you created:</p>
		<button class="custom-button-style">TODO: View my data.</button>
		
		<p>You can download your data, this includes any uploaded content (images + mods + comments). The downloaded data will be a ZIP file including all uploaded images and mods as well as any other text-content as JSON file:</p>
		<button class="custom-button-style">TODO: Download my data.</button>
		
		<br/><br/>
		
		<p>You can freeze your account. This will prevent any attempt to log into it. You will be logged out too - and stay locked out. The only way to unfreeze yourself is by contacting support. This feature can be used in case that your LogicWorld account got hacked or accessed by an unknown unprivileged party. With this you can protect your account here until your issue is resolved.</p>
		<button class="custom-button-style">TODO: Freeze my account!</button>
		
		<br/><br/>
		
		<p>You can unlink your account. This will delete your personal data (logicworld.net account information). This means you will never be able to login to the current account again. You can create a new account with the same LogicWorld account though.</p>
		<p>Keep in mind, that we will not delete your uploaded content. Created mods and comments as well as images inside will persist. You can manually delete them first.</p>
		<button class="custom-button-style">TODO: Unlink/delete account.</button>
	</div>
	<div v-else>
		You are not logged in.
	</div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>

<style scoped>
</style>