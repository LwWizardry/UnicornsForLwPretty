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
		
		<p>Editing mod with ID: {{ state.modDetails.identifier }}</p>
		<p>
			Title:<br />
			<input type="text" v-model="state.changes.title" :disabled="state.updating"/>
		</p>
		<p>
			Caption:<br />
			<textarea v-model="state.changes.caption" :disabled="state.updating"/>
		</p>
		<p>
			Source code link:<br />
			<input type="text" v-model="state.changes.linkSourceCode" :disabled="state.updating"/>
		</p>
		<p>
			Description:<br />
			<textarea v-model="state.changes.description" :disabled="state.updating"/>
		</p>
		
		<p>
			Status: {{ statusText }} <br />
			<button
				class="custom-button-style"
				:disabled="state.updating || !isDirty || !isValid"
				@click="update"
			>Update</button>
		</p>
		
	</div>
</template>

<script setup lang="ts">

import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, reactive } from "vue";
import type { ModDetails } from "@/types/mod";
import { performAPIPostWithSession, performAPIRequest } from "@/code/apiRequests";
import {
	APIResponseInvalid,
	isTypeSuccessfulResponse,
} from "@/types/api";
import { isObjectNullable } from "@/helper/jsonValidator";
import { isTypeModDetailsOptional, parseTypeModDetailsOptional } from "@/types/mod";
import { useRoute } from "vue-router";

const modIdentifier = useRoute().params.modID;
const authStore = useAuthStore();
const state = reactive({
	hasLoaded: false,
	loadingErrorMessage: null as null|string,
	//The original unchanged mod data (as present on the server):
	modDetails: null as null|ModDetails,
	//The data, as currently in the fields:
	changes: {
		title: '',
		caption: '',
		description: '',
		linkSourceCode: '',
	},
	//Prevent updating, while update is in progress:
	updating: false,
	//Anything may insert errors into this text:
	errorText: null as null|string,
});

function setMod(mod: null|ModDetails) {
	state.modDetails = mod;
	if(mod) {
		state.changes.title = mod.title;
		state.changes.caption = mod.caption;
		state.changes.description = mod.description;
		state.changes.linkSourceCode = mod.linkSourceCode === null ? '' : mod.linkSourceCode;
	}
}

const isDirtyTitle = computed(() => {
	if(!state.modDetails) {
		return false;
	}
	return state.modDetails.title.length !== state.changes.title.length
		|| state.modDetails.title !== state.changes.title
});

const isDirtyCaption = computed(() => {
	if(!state.modDetails) {
		return false;
	}
	//Let's hope that the length is cached and this will leverage string comparisons:
	return state.modDetails.caption.length !== state.changes.caption.length
		|| state.modDetails.caption !== state.changes.caption //Rather expensive...
});

const isDirtyDescription = computed(() => {
	if(!state.modDetails) {
		return false;
	}
	//Let's hope that the length is cached and this will leverage string comparisons:
	return state.modDetails.description.length !== state.changes.description.length
		|| state.modDetails.description !== state.modDetails.caption //Rather expensive...
});

const isDirtyLinkSourceCode = computed(() => {
	if(!state.modDetails) {
		return false;
	}
	//If was null:
	if(!state.modDetails.linkSourceCode) {
		return state.changes.linkSourceCode.length !== 0;
	}
	return state.modDetails.linkSourceCode.length !== state.changes.linkSourceCode.length
		|| state.modDetails.linkSourceCode !== state.modDetails.linkSourceCode
});

const isDirty = computed(() => {
	return isDirtyTitle.value
		|| isDirtyCaption.value
		|| isDirtyDescription.value
		|| isDirtyLinkSourceCode.value
});

const titleLength = computed(() => {
	return Array.from(state.changes.title).length;
});

const captionLength = computed(() => {
	return Array.from(state.changes.caption).length;
});

const isValidTitleLower = computed(() => {
	return titleLength.value >= 3
});

const isValidTitleUpper = computed(() => {
	return titleLength.value <= 50;
});

const isValidCaptionLower = computed(() => {
	return captionLength.value >= 10
});

const isValidCaptionUpper = computed(() => {
	return captionLength.value <= 200
});

const isValidDescription = computed(() => {
	//Subject to change, can be increased anytime:
	return Array.from(state.changes.description).length <= 10000
});

const isValidLinkSourceCodeLength = computed(() => {
	//Subject to change, can be increased anytime:
	return Array.from(state.changes.linkSourceCode).length <= 500
});

const isValidLinkSourceCodeFormat = computed(() => {
	//Subject to change, can be increased anytime:
	const link = state.changes.linkSourceCode.trim();
	return Boolean(link.length === 0
		|| link.match(/^https?:\/\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[^\/.]+\.[^\/.0-9]+)(\/.*)?$/))
});

const isValid = computed(() => {
	return isValidTitleLower.value
		&& isValidTitleUpper.value
		&& isValidCaptionLower.value
		&& isValidCaptionUpper.value
		&& isValidDescription.value
		&& isValidLinkSourceCodeLength.value
		&& isValidLinkSourceCodeFormat.value
});

const statusText = computed(() => {
	if(!state.modDetails) {
		return 'This text should never be visible.';
	}
	if(state.updating) {
		return 'Sending changes to server...';
	}
	if(state.errorText) {
		return state.errorText;
	}
	if(!isDirty.value) {
		return 'Waiting for changes.'
	}
	if(!isValid.value) {
		if(!isValidTitleLower.value) {
			return 'Title is too short, must be at least 3 letters long.';
		}
		if(!isValidTitleUpper.value) {
			return 'Title is too big, must be at most 50 letters long.';
		}
		if(!isValidCaptionLower.value) {
			return 'Caption is too small, must be at least 10 letters long.';
		}
		if(!isValidCaptionUpper.value) {
			return 'Caption is too big, must be at most 200 letters long.';
		}
		if(!isValidDescription.value) {
			return 'Description is too big, must be at most 10K letters long. (Contact support, if you need more).'
		}
		if(!isValidLinkSourceCodeLength.value) {
			return 'Source code link, may at most be 500 characters long. (Contact support, if you need more).'
		}
		if(!isValidLinkSourceCodeFormat.value) {
			return 'Source code link must start with http(s):// followed by a domain or IP address.'
		}
	}
	return 'Changes done, press "Update" to apply them!';
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
	setMod(parseTypeModDetailsOptional(response.details));
	state.hasLoaded = true;
}

onMounted(() => {
	loadMod();
});

async function update() {
	state.errorText = null;
	if(!isDirty || !isValid || state.updating || !state.modDetails || !authStore.currentUser) {
		return; //Nothing to do.
	}
	state.updating = true; //Prevent user from touching any data, and indicate that uploading is in progress.
	
	const updateData = {
		identifier: state.modDetails.identifier,
		newTitle: isDirtyTitle.value ? state.changes.title : null,
		newCaption: isDirtyCaption.value ? state.changes.caption : null,
		newDescription: isDirtyDescription.value ? state.changes.description : null,
		newLinkSourceCode: isDirtyLinkSourceCode.value ? state.changes.linkSourceCode : null,
	};
	
	const apiResponse = await performAPIPostWithSession('/mod/edit', authStore.currentUser.token, {data: updateData});
	if(!isTypeSuccessfulResponse(apiResponse)) {
		//TODO: More specific error handling, specific handling of the failure type (invalid session).
		state.errorText = apiResponse.getUserString();
		state.updating = false;
		return;
	}
	
	//There is no data returned, just accept what was sent:
	state.modDetails.title = state.changes.title;
	state.modDetails.caption = state.changes.caption;
	state.modDetails.description = state.changes.description;
	const trimmedSourceCode = state.changes.linkSourceCode.trim();
	state.modDetails.linkSourceCode = trimmedSourceCode.length === 0 ? null : trimmedSourceCode;
	state.updating = false;
}
</script>

<style scoped>
	p {
		margin: 10px 0;
	}
</style>