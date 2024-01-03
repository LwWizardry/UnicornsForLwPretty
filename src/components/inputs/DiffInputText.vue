<template>
	<div>
		<textarea
			v-if="props.textArea"
			v-model="state.current"
			:disabled="props.disabled"
			@input="changed"
		/>
		<input
			v-else
			type="text"
			v-model="state.current"
			:disabled="props.disabled"
			@input="changed"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref, watchEffect } from "vue";

const props = withDefaults(defineProps<{
	disabled?: boolean,
	convertEmptyToNull?: boolean,
	textArea?: boolean,
	originalValue: string|null,
	validators?: Array<(text: null|string, getTextLength: ComputedRef<number>) => null|string>,
}>(), {
	disabled: false,
	convertEmptyToNull: false,
	textArea: false,
	validators: () => [],
});
const emits = defineEmits([
	'stateChanged',
]);

const state = ref({
	current: '' as string,
});
//Also change the internal state, whenever the value gets changed from outside for whatever reason:
watchEffect(() => {
	state.value.current = props.originalValue !== null ? props.originalValue : '';
});

function changed() {
	emits('stateChanged');
}

const getTextLength = computed(() => {
	return Array.from(state.value.current).length;
});
const isDirty = computed(() => {
	const current = state.value.current;
	const original = props.originalValue;
	//If we want to treat empty as null, check if the original was null.
	// Because then the only relevant check is, if the text is not empty.
	if(original === null) {
		return current.length !== 0;
	}
	//Normal length check:
	return current.length !== original.length
		|| current !== original;
});
const getIssues = computed(() => {
	const text = getValue();
	let issues = [];
	for(const validator of props.validators) {
		const result = validator(text, getTextLength);
		if(result) {
			issues.push(result);
		}
	}
	return issues;
});
const isValid = computed(() => {
	return getIssues.value.length === 0;
});

function getValue() {
	if(props.convertEmptyToNull && state.value.current.length === 0) {
		return null;
	}
	return state.value.current;
}

defineExpose({
	isDirty,
	isValid,
	getIssues,
	getValue,
	getTextLength,
});
</script>

<style scoped>
</style>
