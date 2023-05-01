<template>
	<p v-if="!state.hasLoaded">Loading mod details...</p>
	<div v-else-if="state.modToDisplay">
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
import { isTypeSuccessfulResponse } from "@/types/api";
import type { ModDetails } from "@/types/mod";
import { isTypeModDetailsOptional, parseTypeModDetailsOptional } from "@/types/mod";
import { isObjectNullable } from "@/helper/jsonValidator";

const identity = useRoute().params.mod;

const state = reactive({
	hasLoaded: false,
	modToDisplay: null as null|ModDetails,
});

async function loadMod() {
	const apiResponse = await performAPIRequest('/mod-details?identifier=' + identity);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isObjectNullable(response.details) || !isTypeModDetailsOptional(response.details)) {
		//TODO: Further handling ofc...
		console.log("Failed to query mods from backend, response was:", response)
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
