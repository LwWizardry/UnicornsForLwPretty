<template>
	<p>Title:</p>
	<DiffInputText
		ref="fieldTitle"
		:disabled="state.updating"
		:originalValue="props.modDetails.title"
		:validators="[
			minLengthValidator(3, 'Title'),
			maxLengthValidator(50, 'Title'),
		]"
		errors="null"
		@state-changed="updateStatus"
	/>
	<p>Caption:</p>
	<DiffInputText
		ref="fieldCaption"
		:disabled="state.updating"
		:originalValue="props.modDetails.caption"
		:textArea="true"
		:validators="[
			minLengthValidator(10, 'Caption'),
			maxLengthValidator(200, 'Caption'),
		]"
		errors="null"
		@state-changed="updateStatus"
	/>
	<p>Logo:</p>
	<DiffInputImage
		ref="fieldLogo"
		:disabled="state.updating"
		:originalValue="resolvedLogoURL"
		@state-changed="updateStatus"
	/>
	<p>Source code link:</p>
	<DiffInputText
		ref="fieldSourceCode"
		:disabled="state.updating"
		:convertEmptyToNull="true"
		:originalValue="props.modDetails.linkSourceCode"
		:validators="[
			maxLengthValidator(500, 'Source code link', ' (Contact support, if you need more).'),
			linkValidator,
		]"
		errors="null"
		@state-changed="updateStatus"
	/>
	<p>Description:</p>
	<DiffInputText
		ref="fieldDescription"
		:disabled="state.updating"
		:originalValue="props.modDetails.description"
		:textArea="true"
		:validators="[
			maxLengthValidator(10000, 'Description', ' (Contact support, if you need more).'),
		]"
		errors="null"
		@state-changed="updateStatus"
	/>
	
	<div>
		<div v-if="typeof state.statusText === 'string'">
			Status: {{ state.statusText }}
		</div>
		<div v-else-if="state.statusText.length === 1">
			Status: {{ state.statusText[0] }}
		</div>
		
		<div v-else>
			Status:
			<ul v-for="line in state.statusText">
				<li>{{line}}</li>
			</ul>
		</div>
		<button
			class="custom-button-style"
			:disabled="state.updating || !state.isDirty || !state.isValid"
			@click="update"
		>Update</button>
	</div>
</template>

<script setup lang="ts">
import { imageFromMod, type ModDetails } from "@/types/mod";
import { computed, type ComputedRef, ref, nextTick, onMounted } from "vue";
import { performAPIPostWithSession } from "@/code/apiRequests";
import { isTypeSuccessfulResponse } from "@/types/api";
import type { useAuthStore } from "@/stores/auth";
import DiffInputText from "@/components/inputs/DiffInputText.vue";
import DiffInputImage from "@/components/inputs/DiffInputImage.vue";

//TODO: Add text backup. To save text during reload/crash. Else stuff gonna be uff.

type DiffInputTextType = InstanceType<typeof DiffInputText>;

const fieldTitle = ref<DiffInputTextType | null>(null);
const fieldCaption = ref<DiffInputTextType | null>(null);
const fieldLogo = ref<InstanceType<typeof DiffInputImage> | null>(null);
const fieldSourceCode = ref<DiffInputTextType | null>(null);
const fieldDescription = ref<DiffInputTextType | null>(null);

const props = defineProps<{
	modDetails: ModDetails,
	authStore: ReturnType<typeof useAuthStore>,
}>();
const state = ref({
	hasLoaded: false,
	loadingErrorMessage: null as null|string,
	//Prevent updating, while update is in progress:
	updating: false,
	//Anything may insert errors into this text:
	errorText: null as null|string,
	//State:
	isDirty: false,
	isValid: true,
	statusText: 'Not initialized!' as Array<string>|string,
});

onMounted(() => {
	updateStatus();
});

const resolvedLogoURL = computed(() => {
	if(props.modDetails.image === null) {
		return null;
	} else {
		return imageFromMod(props.modDetails);
	}
});

function updateStatus()
{
	//Go over the components and connect their state:
	//Also don't judge this code, just make a PR...
	state.value.isDirty = (fieldTitle.value?.isDirty ?? false)
		|| (fieldCaption.value?.isDirty ?? false)
		|| (fieldDescription.value?.isDirty ?? false)
		|| (fieldSourceCode.value?.isDirty ?? false)
		|| (fieldLogo.value?.isDirty ?? false);
	state.value.isValid = (fieldTitle.value?.isValid ?? false)
		&& (fieldCaption.value?.isValid ?? false)
		&& (fieldDescription.value?.isValid ?? false)
		&& (fieldSourceCode.value?.isValid ?? false);
	updateStatusText();
}

function minLengthValidator(length: number, name: string, suffix = ''): (text: null|string, getTextLength: ComputedRef<number>) => null|string {
	return function (text: null|string, getTextLength: ComputedRef<number>) {
		return getTextLength.value >= length ? null : name + '  is too short, must be at least ' + length + ' letters long.' + suffix;
	};
}

function maxLengthValidator(length: number, name: string, suffix = ''): (text: null|string, getTextLength: ComputedRef<number>) => null|string {
	return function (text: null|string, getTextLength: ComputedRef<number>) {
		return getTextLength.value <= length ? null : name + '  is too big, must be at most ' + length + ' letters long.' + suffix;
	};
}

const linkValidator = function(text: null|string, getTextLength: ComputedRef<number>) {
	return text === null ||
	Boolean(text.match(/^https?:\/\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[^\/.]+\.[^\/.0-9]+)(\/.*)?$/))
		? null
		: 'Source code link must start with http(s):// followed by a domain or IP address.';
};

function updateStatusText() {
	state.value.statusText = generateStatusText();
}

function generateStatusText() {
	if(!props.modDetails) {
		return 'This text should never be visible.';
	}
	if(state.value.updating) {
		return 'Sending changes to server...';
	}
	let errorText = state.value.errorText;
	//TODO: Add to secondary status
	if(errorText) {
		return errorText;
	}
	if(!state.value.isDirty) {
		return 'Waiting for changes.'
	}
	if(!state.value.isValid) {
		let issues = fieldTitle.value!.getIssues.concat(
			fieldCaption.value!.getIssues,
			fieldDescription.value!.getIssues,
			fieldSourceCode.value!.getIssues
		);
		if(issues) {
			return issues;
		}
	}
	return 'Changes done, press "Update" to apply them!';
}

async function update() {
	state.value.errorText = null;
	if(
		!state.value.isDirty || !state.value.isValid || state.value.updating || !props.modDetails || !props.authStore.currentUser
		//If any of the refs are not initialized, something went horribly wrong, don't execute.
		|| !fieldTitle.value || !fieldCaption.value || !fieldDescription.value || !fieldSourceCode.value || !fieldLogo.value
	) {
		return; //Nothing to do.
	}
	state.value.updating = true; //Prevent user from touching any data, and indicate that uploading is in progress.
	updateStatusText(); //Update the status text...
	
	const updateData = {
		identifier: props.modDetails.identifier,
		newTitle: fieldTitle.value.isDirty ? fieldTitle.value.getValue() : null,
		newCaption: fieldCaption.value.isDirty ? fieldCaption.value.getValue() : null,
		newDescription: fieldDescription.value ? fieldDescription.value.getValue() : null,
		newLinkSourceCode: fieldSourceCode.value.isDirty ? fieldSourceCode.value.getValue() : null,
		newLogo: !fieldLogo.value.isDirty ? null : {
			data: await fieldLogo.value?.asBase64(),
		},
	};
	
	const apiResponse = await performAPIPostWithSession('/mod/edit', props.authStore.currentUser.token, {data: updateData});
	if (!isTypeSuccessfulResponse(apiResponse)) {
		//TODO: More specific error handling, specific handling of the failure type (invalid session).
		state.value.errorText = apiResponse.getUserString();
		state.value.updating = false;
		updateStatusText(); //Update the status text...
		return;
	}
	
	//There is no data returned, just accept what was sent:
	props.modDetails.title = fieldTitle.value.getValue()!;
	props.modDetails.caption = fieldCaption.value.getValue()!;
	props.modDetails.description = fieldDescription.value.getValue()!;
	props.modDetails.linkSourceCode = fieldSourceCode.value.getValue(); //The only getter that actually may return 'null'
	props.modDetails.image = apiResponse.data.image ? apiResponse.data.image : null;
	state.value.updating = false;
	await nextTick(updateStatus);
}
</script>

<style scoped>
	p {
		margin: 10px 0;
	}
</style>