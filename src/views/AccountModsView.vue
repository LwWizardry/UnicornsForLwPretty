<template>
	<!-- Login state is taken care of parent AccountView. -->
	<RouterLink :to="{name: 'new-mod'}" class="custom-button-style">Add new mod</RouterLink>
	
	<h1>Your mods:</h1>
	<p v-if="state.errorWhileLoading">Failed to load mod list: {{ state.errorWhileLoading }}</p>
	<p v-else-if="!state.hasLoaded">Mod list is loading...</p>
	<div v-else>
		<p v-if="state.yourMods.length === 0">You do not have any mods yet...</p>
		<ul v-else v-for="mod in state.yourMods">
			<li>
				<router-link :to="{name: 'mod-details', params: {modID: 'mod-' + mod.identifier}}">Name: {{mod.title}}</router-link>
				(<router-link :to="{name: 'mod-edit', params: {modID: 'mod-' + mod.identifier}}">Edit!</router-link>)
			</li>
		</ul>
	</div>
	
	<!-- Collaborating mods -->
	<!-- Favored/Starred/Subscribed mods -->
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { ModSummaryAnonym } from "@/types/mod";
import { performAPIRequest } from "@/code/apiRequests";
import { useAuthStore } from "@/stores/auth";
import { APIResponseInvalid, isTypeSuccessfulResponse } from "@/types/api";
import { isTypeModSummaryAnonymArray } from "@/types/mod";

const authStore = useAuthStore();
const state = ref({
	hasLoaded: false,
	errorWhileLoading: null as null|string,
	yourMods: [] as ModSummaryAnonym[]
});

onMounted(() => {
	loadUserMods();
});

async function loadUserMods() {
	if(authStore.currentUser === null) {
		return;
	}
	const apiResponse = await performAPIRequest('/mod/user-list?identifier=' + authStore.currentUser.identifier);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		state.value.errorWhileLoading = apiResponse.getUserString();
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isTypeModSummaryAnonymArray(response)) {
		state.value.errorWhileLoading = new APIResponseInvalid(response).getUserString();
		return; //Failed!
	}
	
	state.value.yourMods = response;
	state.value.hasLoaded = true;
}
</script>

<style scoped>
</style>