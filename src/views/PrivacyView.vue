<template>
	<span v-html="privacyHTML"></span>
</template>

<script setup lang="ts">
import content from '/src/assets/legal/privacy.md?raw';

const privacyHTML = window.__markdown.render(content);
</script>

<style scoped>
@import '/src/assets/markdown.css';
</style>
