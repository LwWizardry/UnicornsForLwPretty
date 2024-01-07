<template>
	<div class="title">
		<h1 class="green">Logic World Community Mod Portal</h1>
		<h3>
			Browse for mods and download your choice <span style="font-weight: lighter">&lt;/randomSlogan&gt;</span>
		</h3>
	</div>
</template>

<script setup lang="ts">
</script>


<style scoped>
h1 {
	font-weight: 500;
	font-size: 2.6rem;
	top: -10px;
}

h3 {
	font-size: 1.2rem;
}

.title h1,
.title h3 {
	text-align: center;
}

@media (min-width: 1024px) {
	.title h1,
	.title h3 {
		text-align: left;
	}
}
</style>