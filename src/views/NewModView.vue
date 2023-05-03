<template>
	<h1>Add a new mod!</h1>
	
	<h1 v-if="!authStore.isLoggedIn">WARNING YOU ARE NOT LOGGED IN! LOG IN TO PROCEED!</h1>
	
	<p>
		Name/Title:<br />
		<input type="text" v-model="state.content.title"/><br />
		<i>The title of the mod, shown in the mod list and in link previews.</i>
	</p>
	
	<p>
		Summary/Caption:<br />
		<textarea v-model="state.content.caption" /><br />
		<i>
			A short description of the mod, shown in the mod list and in link previews.<br />
			Must be at least 10 and at most 200 characters.
		</i>
	</p>
	
	<br />
	
	<p>
		Issues: {{ state.issues }}
	</p>
	<p>
		Once done, you can save your mod. It will be marked as hidden. Until change.
		<br />
		<button class="custom-button-style" @click="submitMod" :disabled="!isValid">Save!</button>
	</p>
</template>

<script setup lang="ts">

import { computed, reactive, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { performAPIPostWithSession } from "@/code/apiRequests";
import { isTypeSuccessfulResponse } from "@/types/api";

const authStore = useAuthStore();

const state = reactive({
	submitting: false,
	issues: 'None',
	content: {
		title: '',
		caption: '',
	},
});

const isValid = computed(() => {
	const length = state.content.caption.trim().length;
	return authStore.isLoggedIn
		&& !state.submitting
		&& length >= 10 && length <= 200
		&& state.content.title.trim().length >= 3;
});

watch(state.content, () => {
	updateIssue();
});

function updateIssue() {
	const content = state.content;
	if(!authStore.isLoggedIn) {
		state.issues = 'Not logged in, log in to submit a mod.';
	} else if(content.title.trim().length < 3) {
		state.issues = 'Title is too short, should have at least 3 letters.';
	} else {
		const captionLength = content.caption.trim().length;
		if(captionLength < 10) {
			state.issues = 'Caption is too short, should have at least 10 letters.';
		} else if(captionLength >= 200) {
			state.issues = 'Caption is too long, should have at most 200 letters.';
		} else {
			state.issues = 'None';
		}
	}
}
updateIssue();

async function submitMod() {
	const session = authStore.currentUser?.token;
	if(!isValid || !session) {
		return;
	}
	state.submitting = true;
	
	const apiResponse = await performAPIPostWithSession(
		'/mod/post',
		session,
		{
			data: state.content,
		}
	);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		state.submitting = false;
		//TBI: Actions to handle, in case of failure? (Session timeout, for example).
		state.issues = apiResponse.getUserString();
		return;
	}
	
	//TODO: Parse identifier and open the mod's edit view. Or something similar.
	console.log('Probably success, data:', apiResponse.data)
	
	state.issues = 'Mod submitted, reload the page if you want to submit another one - PLEASE DO NOT SPAM MODS! (I will have to delete them all anyway though - later).';
	//state.submitting = false;
}
</script>

<style scoped>

	p {
		margin: 8px 0;
	}
</style>
