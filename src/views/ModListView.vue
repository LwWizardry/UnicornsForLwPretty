<template>
	<div>
		<p>Here would be some sidebar with filters or tags, maybe a top bar?</p>
		<p>The main content would be either a list or a grid of mod entries. The list has more details.</p>
		<p v-if="authStore.isLoggedIn">Do you have an unlisted mod? <RouterLink to="/new-mod" class="custom-button-style">Add mod!</RouterLink></p>
	</div>
	<div>
		<p v-if="state.loadingErrorMessage">Failed to load mod list: {{ state.loadingErrorMessage }}</p>
		<p v-else-if="!state.mods">Mod list is loading...</p>
		<ul v-else>
			<li v-for="mod in state.mods" :key="mod.title" class="mod-summary">
				<RouterLink :to="'/mod/mod-' + mod.identifier" class="mod">
						<img v-if="mod.image" :src="imageFromMod(mod)" class="logo"/>
						<h3>{{ mod.title }}</h3>
						<p>{{ mod.caption }}</p>
						<p>By {{ mod.owner.getDisplayName() }}</p>
				</RouterLink>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import { useAuthStore } from "@/stores/auth";
import type { ModSummary } from "@/types/mod";
import { performAPIRequest } from "@/code/apiRequests";
import { imageFromMod, isTypeModSummaryArray, parseTypeModSummaryArray } from "@/types/mod";
import { APIResponseInvalid, isTypeSuccessfulResponse } from "@/types/api";

const authStore = useAuthStore();

const state = ref({
	loadingErrorMessage: null as null|string,
	mods: null as ModSummary[]|null,
});

onMounted(() => {
	//TODO: Currently this is running, whenever the "tab" is visited. Reduce this somehow.
	loadMods();
})

async function loadMods() {
	const apiResponse = await performAPIRequest('/mods');
	if(!isTypeSuccessfulResponse(apiResponse)) {
		state.value.loadingErrorMessage = apiResponse.getUserString();
		return; //Failed!
	}
	const response = apiResponse.data;
	if(!isTypeModSummaryArray(response)) {
		state.value.loadingErrorMessage = new APIResponseInvalid(response).getUserString();
		return; //Failed!
	}
	state.value.mods = parseTypeModSummaryArray(response);
}
</script>

<style scoped>
	.mod {
		background-color: #222;
		border-radius: 10px;
		padding: 10px;
		display: block;
		margin: 5px;
	}
	.logo {
		max-width: 1000px;
		max-height: 100px;
	}
</style>
