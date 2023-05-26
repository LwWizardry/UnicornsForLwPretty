<template>
	<div v-if="!authStore.currentUser">
		<p>You need to be logged in, to edit (your) mods.</p>
	</div>
	<div v-else-if="state.loadingErrorMessage">
		<p>Failed to load mod: {{ state.loadingErrorMessage }}</p>
	</div>
	<div v-else-if="!state.hasLoaded">
		<p>Loading mod details...</p>
	</div>
	<div v-else-if="!state.modDetails">
		<p>This mod does not exist...</p>
	</div>
	<div v-else-if="state.modDetails.owner.identifier !== authStore.currentUser.identifier">
		<p>Only the mod author may edit this mod.</p>
	</div>
	
	<div v-else>
		
		<p>Editing mod with ID: {{ (state.modDetails as ModDetails).identifier }}</p>
		<div class="content-box">
			<EditModDetails
				:modDetails="state.modDetails"
				:authStore="authStore"
			/>
		</div>
		
	</div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";
import type { ModDetails } from "@/types/mod";
import { performAPIRequest } from "@/code/apiRequests";
import {
	APIResponseInvalid,
	isTypeSuccessfulResponse,
} from "@/types/api";
import { isObjectNullable } from "@/helper/jsonValidator";
import { isTypeModDetailsOptional, parseTypeModDetailsOptional } from "@/types/mod";
import { useRoute } from "vue-router";
import EditModDetails from "@/components/EditModDetails.vue";

const modIdentifier = useRoute().params.modID;
const authStore = useAuthStore();
const state = ref({
	hasLoaded: false,
	loadingErrorMessage: null as null|string,
	//The original unchanged mod data (as present on the server):
	modDetails: null as null|ModDetails,
});

async function loadMod() {
	const apiResponse = await performAPIRequest('/mod-details?identifier=' + modIdentifier);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		state.value.loadingErrorMessage = apiResponse.getUserString();
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isObjectNullable(response.details) || !isTypeModDetailsOptional(response.details)) {
		state.value.loadingErrorMessage = new APIResponseInvalid(response).getUserString();
		return; //Failed!
	}
	state.value.modDetails = parseTypeModDetailsOptional(response.details);
	state.value.hasLoaded = true;
}

onMounted(() => {
	loadMod();
});
</script>

<style scoped>
	p {
		margin: 10px 0;
	}
	
	.content-box {
		border: solid 1px green;
		padding: 3px 10px;
		border-radius: 10px;
		margin: 10px 0;
	}
</style>