<template>
	<p>
		Title:<br />
		<input type="text" v-model="state.changes.title" :disabled="state.updating"/>
	</p>
	<p>
		Caption:<br />
		<textarea v-model="state.changes.caption" :disabled="state.updating"/>
	</p>
	<div>
		Logo:<br />
		<button
			class="custom-button-style"
			@click="logoChooser?.click()"
			:disabled="state.updating">
			Choose image.
		</button>
		<button
			v-if="state.changes.image"
			class="custom-button-style"
			@click="state.changes.image = null"
			:disabled="state.updating">
			Delete image.
		</button>
		<button
			v-if="state.changes.image !== (props.modDetails as ModDetails).image"
			class="custom-button-style"
			@click="state.changes.image = (props.modDetails as ModDetails).image"
			:disabled="state.updating">
			Restore original.
		</button>
		<br />
		
		<i>Max allowed file size is 14MB.</i>
		<br />
		
		<!-- TODO: Drop support! -->
		<input
			type="file"
			accept="image/gif, image/jpeg, image/webp, image/png"
			class="custom-button-style-inner"
			style="display: none"
			
			ref="logoChooser"
			@change="logoChange"
		>
		
		<p>
			<img v-if="isString(state.changes.image)"
			     :src="imageFromMod(props.modDetails as ModDetails)"
			     alt="Mod Logo"
			     class="logo-wrapper"
			/>
			<img v-else-if="state.changes.image"
			     :src="(state.changes.image as ImageData).blob"
			     alt="Mod Logo"
			     class="logo-wrapper"
			/>
		</p>
	</div>
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
</template>

<script setup lang="ts">
import { imageFromMod, type ModDetails } from "@/types/mod";
import { isString } from "@/helper/jsonValidator";
import { computed, reactive, ref } from "vue";
import { performAPIPostWithSession } from "@/code/apiRequests";
import { isTypeSuccessfulResponse } from "@/types/api";

interface ImageData {
	blob: string,
	data: File,
}

const logoChooser = ref<HTMLInputElement | null>(null);

const props = defineProps(['modDetails', 'authStore']);
const state = reactive({
	hasLoaded: false,
	loadingErrorMessage: null as null|string,
	//The data, as currently in the fields:
	changes: {
		title: '',
		caption: '',
		description: '',
		linkSourceCode: '',
		image: null as null|string|ImageData,
	},
	//Prevent updating, while update is in progress:
	updating: false,
	//Anything may insert errors into this text:
	errorText: null as null|string,
});
setMod(props.modDetails);

function logoChange(event: any) {
	state.errorText = null;
	const files: FileList = event.target.files;
	if(files.length !== 1) {
		//TODO: Error somewhere else.
		console.error('Somehow received more than one logo file via file chooser:', files);
		return;
	}
	const file = files[0];
	console.log(file);
	if(file.size > 14000000) {
		//TODO: This way of setting errors is bad, there should be a popout. It is too persistent until some other data changes.
		state.errorText = 'Image file is too large, max allowed is 14MB.';
		state.changes.image = null;
		return;
	}
	state.changes.image = {
		blob: URL.createObjectURL(file),
		data: file,
	};
}

function setMod(mod: null|ModDetails) {
	if(mod) {
		state.changes.title = mod.title;
		state.changes.caption = mod.caption;
		state.changes.description = mod.description;
		state.changes.linkSourceCode = mod.linkSourceCode === null ? '' : mod.linkSourceCode;
		state.changes.image = mod.image;
	}
}

const isDirtyTitle = computed(() => {
	if(!props.modDetails) {
		return false;
	}
	return props.modDetails.title.length !== state.changes.title.length
		|| props.modDetails.title !== state.changes.title
});

const isDirtyCaption = computed(() => {
	if(!props.modDetails) {
		return false;
	}
	//Let's hope that the length is cached and this will leverage string comparisons:
	return props.modDetails.caption.length !== state.changes.caption.length
		|| props.modDetails.caption !== state.changes.caption //Rather expensive...
});

const isDirtyDescription = computed(() => {
	if(!props.modDetails) {
		return false;
	}
	//Let's hope that the length is cached and this will leverage string comparisons:
	return props.modDetails.description.length !== state.changes.description.length
		|| props.modDetails.description !== props.modDetails.description //Rather expensive...
});

const isDirtyLinkSourceCode = computed(() => {
	if(!props.modDetails) {
		return false;
	}
	//If was null:
	if(!props.modDetails.linkSourceCode) {
		return state.changes.linkSourceCode.length !== 0;
	}
	return props.modDetails.linkSourceCode.length !== state.changes.linkSourceCode.length
		|| props.modDetails.linkSourceCode !== props.modDetails.linkSourceCode
});

const isDirtyLogo = computed(() => {
	if(!props.modDetails) {
		return false;
	}
	return props.modDetails.image !== state.changes.image
});

const isDirty = computed(() => {
	return isDirtyTitle.value
		|| isDirtyCaption.value
		|| isDirtyDescription.value
		|| isDirtyLinkSourceCode.value
		|| isDirtyLogo.value
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
	if(!props.modDetails) {
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

const file2Base64 = (file:File):Promise<string> => {
	return new Promise<string> ((resolve,reject)=> {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		//Filer prefix: 'data:image/png;base64,<actualBASE64>'
		reader.onload = () => resolve(reader.result?.toString().replace(/^data:(.*,)?/, '') || '');
		reader.onerror = error => reject(error);
	})
}

async function update() {
	state.errorText = null;
	if(!isDirty || !isValid || state.updating || !props.modDetails || !props.authStore.currentUser) {
		return; //Nothing to do.
	}
	state.updating = true; //Prevent user from touching any data, and indicate that uploading is in progress.
	
	const updateData = {
		identifier: props.modDetails.identifier,
		newTitle: isDirtyTitle.value ? state.changes.title : null,
		newCaption: isDirtyCaption.value ? state.changes.caption : null,
		newDescription: isDirtyDescription.value ? state.changes.description : null,
		newLinkSourceCode: isDirtyLinkSourceCode.value ? state.changes.linkSourceCode : null,
		newLogo: !isDirtyLogo.value ? null : {
			data: state.changes.image === null ? null : await file2Base64((state.changes.image as ImageData).data),
		},
	};
	
	const apiResponse = await performAPIPostWithSession('/mod/edit', props.authStore.currentUser.token, {data: updateData});
	if(!isTypeSuccessfulResponse(apiResponse)) {
		//TODO: More specific error handling, specific handling of the failure type (invalid session).
		state.errorText = apiResponse.getUserString();
		state.updating = false;
		return;
	}
	
	//There is no data returned, just accept what was sent:
	props.modDetails.title = state.changes.title;
	props.modDetails.caption = state.changes.caption;
	props.modDetails.description = state.changes.description;
	const trimmedSourceCode = state.changes.linkSourceCode.trim();
	props.modDetails.linkSourceCode = trimmedSourceCode.length === 0 ? null : trimmedSourceCode;
	props.modDetails.image = apiResponse.data.image ? apiResponse.data.image : null;
	state.changes.image = props.modDetails.image;
	state.updating = false;
}
</script>

<style scoped>
	p {
		margin: 10px 0;
	}
	
	.logo-wrapper {
		max-height: 250px;
		max-width: 1000px;
		border-radius: 20px;
		padding: 10px;
		border: solid 1px green;
	}
</style>