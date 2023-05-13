<template>
	<span v-html="termsHTML"></span>
</template>

<script setup lang="ts">
	import content from '/src/assets/legal/terms.md?raw';
	import { restoreContact } from "@/helper/contactRestoration";
	
	const termsHTML = window.__markdown.render(restoreContact(content));
</script>

<style scoped>
@import '/src/assets/markdown.css';
</style>
