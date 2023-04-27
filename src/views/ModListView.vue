<template>
	<div>
		<p>Here would be some sidebar with filters or tags, maybe a top bar?</p>
		<p>The main content would be either a list or a grid of mod entries. The list has more details.</p>
		<p v-if="authStore.isLoggedIn">Do you have an unlisted mod? <RouterLink to="/new-mod" class="custom-button-style">Add mod!</RouterLink></p>
	</div>
	<div>
		<p v-if="!state.mods">Mod list is loading...</p>
		<ul v-else>
			<li v-for="mod in state.mods" :key="mod.title" class="mod-summary">
				<RouterLink :to="'/mod/mod-' + mod.identifier">
						<h3>{{ mod.title }}</h3>
						<p>{{ mod.caption }}</p>
				</RouterLink>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import {onMounted, reactive} from "vue";
import { useAuthStore } from "@/stores/auth";
import type { ModSummary } from "@/types/mod";
import { performAPIRequest } from "@/code/apiRequests";
import { isTypeModSummaryArray } from "@/types/mod";
import { isTypeSuccessfulResponse } from "@/types/api";

const authStore = useAuthStore();

const state = reactive({
	mods: null as ModSummary[]|null,
});

onMounted(() => {
	//TODO: Currently this is running, whenever the "tab" is visited. Reduce this somehow.
	loadMods();
})

async function loadMods() {
	const apiResponse = await performAPIRequest('/mods');
	if(!isTypeSuccessfulResponse(apiResponse)) {
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isTypeModSummaryArray(response)) {
		//TODO: Further handling ofc...
		console.log("Failed to query mods from backend, response was:", response)
		return; //Failed!
	}
	state.mods = response;
}
</script>
