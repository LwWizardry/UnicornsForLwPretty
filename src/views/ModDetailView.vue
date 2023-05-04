<template>
	<p v-if="state.loadingErrorMessage">Error while loading: {{ state.loadingErrorMessage }}</p>
	<p v-else-if="!state.hasLoaded">Loading mod details...</p>
	<div v-else-if="state.modToDisplay">
		<div v-if="authStore.currentUser !== null && state.modToDisplay.owner.identifier == authStore.currentUser.identifier">
			<RouterLink :to="{name: 'mod-edit', params: {modID: modIdentifier}}">Edit this mod.</RouterLink>
		</div>
		<p>Mod title: {{ state.modToDisplay.title }}</p>
		<p>Caption: {{ state.modToDisplay.caption }}</p>
		<p>Maintainer: {{ state.modToDisplay.owner.getDisplayName() }}</p>
	</div>
	<div v-else>
		<p>This mod does nod exist!</p>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { performAPIRequest } from "@/code/apiRequests";
import { APIResponseInvalid, isTypeSuccessfulResponse } from "@/types/api";
import type { ModDetails } from "@/types/mod";
import { isTypeModDetailsOptional, parseTypeModDetailsOptional } from "@/types/mod";
import { isObjectNullable } from "@/helper/jsonValidator";
import { useAuthStore } from "@/stores/auth";

const modIdentifier = useRoute().params.modID;
const authStore = useAuthStore();
const state = reactive({
	hasLoaded: false,
	loadingErrorMessage: null as null|string,
	modToDisplay: null as null|ModDetails,
});

async function loadMod() {
	const apiResponse = await performAPIRequest('/mod-details?identifier=' + modIdentifier);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		state.loadingErrorMessage = apiResponse.getUserString();
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isObjectNullable(response.details) || !isTypeModDetailsOptional(response.details)) {
		state.loadingErrorMessage = new APIResponseInvalid(response).getUserString();
		return; //Failed!
	}
	state.modToDisplay = parseTypeModDetailsOptional(response.details);
	state.hasLoaded = true;
}

onMounted(() => {
	loadMod();
});
</script>

<style scoped>
</style>
