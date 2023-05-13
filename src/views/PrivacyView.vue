<template>
	<span v-html="privacyHTML"></span>
</template>

<script setup lang="ts">
import content from '/src/assets/legal/privacy.md?raw';
import { restoreContact } from "@/helper/contactRestoration";

const privacyHTML = window.__markdown.render(restoreContact(content));
</script>

<style scoped>
@import '/src/assets/markdown.css';
</style>
