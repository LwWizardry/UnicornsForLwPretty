<template>
	<span v-html="termsHTML"></span>
</template>

<script setup lang="ts">
	import content from '/src/assets/legal/terms.md?raw';
	
	const termsHTML = window.__markdown.render(content);
</script>

<style scoped>
/* Temporary fix, until frontend style is reworked: */
::v-deep(strong) {
	font-weight: bold;
}
</style>
