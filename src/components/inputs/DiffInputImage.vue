<template>
	<div>
		<p>
			<button
				class="custom-button-style"
				@click="state.error = null; logoChooser?.click()"
				:disabled="props.disabled">
				Choose image.
			</button>
			<button
				v-if="state.current"
				class="custom-button-style"
				@click="state.error = null; state.current = null; emits('stateChanged')"
				:disabled="props.disabled">
				Delete image.
			</button>
			<button
				v-if="state.current !== props.originalValue"
				class="custom-button-style"
				@click="state.error = null; state.current = props.originalValue; emits('stateChanged')"
				:disabled="props.disabled">
				Restore original.
			</button>
		</p>
		<p>
			<i>Max allowed file size is 14MB.</i>
		</p>
		<p v-if="state.current">
			<img
				:src="isString(state.current) ? props.originalValue! : (state.current as ImageData).blob"
				alt="Mod Logo"
				class="logo-wrapper"
			/>
		</p>
		<p v-if="state.error">
			{{ state.error }}
		</p>
		
		<!-- Hidden file input, is being triggered by @click() on button. -->
		<!-- TODO: Drop support! -->
		<input
			type="file"
			accept="image/gif, image/jpeg, image/webp, image/png"
			style="display: none"
			ref="logoChooser"
			@change="logoChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { isString } from "@/helper/jsonValidator";
import { computed, ref, watch } from "vue";

interface ImageData {
	blob: string,
	data: File,
}

const logoChooser = ref<HTMLInputElement | null>(null);

const props = withDefaults(defineProps<{
	disabled?: boolean,
	originalValue: string|null,
}>(), {
	disabled: false,
});

const state = ref({
	//The data, as currently in the fields:
	current: null as null|string|ImageData,
	error: null as null|string,
});
const emits = defineEmits([
	'stateChanged',
]);
state.value.current = props.originalValue;
//Overwrite the value, if it changed externally:
watch(() => props.originalValue, () => {
	state.value.current = props.originalValue;
});

const isDirty = computed(() => {
	return props.originalValue !== state.value.current;
});

function logoChange(event: any) {
	state.value.error = null;
	const files: FileList = event.target.files;
	if(files.length !== 1) {
		//TODO: Error somewhere else.
		console.error('Somehow received more than one logo file via file chooser:', files);
		return;
	}
	const file = files[0];
	if(file.size > 14000000) {
		//TODO: This way of setting errors is bad, there should be a popout. It is too persistent until some other data changes.
		state.value.error = 'Image file is too large, max allowed is 14MB.';
		state.value.current = null;
		return;
	}
	state.value.current = {
		blob: URL.createObjectURL(file),
		data: file,
	};
	emits('stateChanged');
}

const file2Base64 = (file:File):Promise<string> => {
	return new Promise<string> ((resolve,reject)=> {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		//Filer prefix: 'data:image/png;base64,<actualBASE64>'
		reader.onload = () => resolve(reader.result?.toString().replace(/^data:(.*,)?/, '') || '');
		reader.onerror = error => reject(error);
	});
}

async function asBase64() {
	return state.value.current === null ? null : await file2Base64((state.value.current as ImageData).data)
}

defineExpose({
	isDirty,
	asBase64,
});
</script>

<style scoped>
	.logo-wrapper {
		max-height: 250px;
		max-width: 1000px;
		border-radius: 20px;
		padding: 10px;
		border: solid 1px green;
	}
</style>
