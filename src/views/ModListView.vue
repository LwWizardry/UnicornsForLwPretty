<template>
	<div>
		<p>Here would be some sidebar with filters or tags, maybe a top bar?</p>
		<p>The main content would be either a list or a grid of mod entries. The list has more details.</p>
	</div>
	<div>
		<p v-if="!state.mods">Mod list is loading...</p>
		<ul v-else>
			<li v-for="mod in state.mods" :key="mod.name">
				{{ mod.name }}
			</li>
		</ul>
	</div>
</template>

<script setup>
import {onMounted, reactive} from "vue";
import axios from "axios";

const state = reactive({mods: null})

onMounted(() => {
	//TBI: Currently this is running, whenever the "tab" is visited. Reduce this somehow.
	const remote = import.meta.env.PROD ? 'https://api-lwmods.ecconia.com/mods' : 'http://api-lwmods.localhost/mods';
	console.log("Getting mods from backend: ", remote); //TODO: Remove this message eventually.
	axios.get(remote)
		.then((response) => {
			state.mods = response.data;
		})
		.catch((error) => {
			console.log("Error: ", error)
		});
})
</script>
