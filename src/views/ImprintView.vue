<template>
	<span v-html="imprintHTML"></span>
</template>

<script setup lang="ts">
import content from '/src/assets/legal/imprint.html?raw';

const imprintHTML = content;
</script>

<style scoped>
::v-deep(p) {
	border: #aaa 1px solid;
	padding: 3px;
}
</style>
