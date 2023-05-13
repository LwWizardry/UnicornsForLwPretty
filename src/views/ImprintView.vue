<template>
	<span v-html="imprintHTML"></span>
</template>

<script setup lang="ts">
import content from '/src/assets/legal/imprint.html?raw';
import { restoreContact } from "@/helper/contactRestoration";

const imprintHTML = restoreContact(content);
</script>

<style scoped>
@import '/src/assets/markdown.css';
::v-deep(p) {
	border: #aaa 1px solid;
	padding: 3px;
}
</style>
