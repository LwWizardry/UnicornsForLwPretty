<template>
  <div class="container md:mx-auto px-4">
    <p class="text-bg-secondary">I'm a secondary backed text</p>
    <p class="text-bg-light">I'm a light mode text</p>
    <p class="text-bg-primary">I'm a primary backed text</p>
    <p class="text-bg-danger">I'm a danger backed text</p>
    <p class="text-bg-info">I'm an info backed text</p>
    <p class="text-bg-warning">I'm a warning backed text</p> <p class="text-bg-secondary">I'm a secondary backed text</p>
    <p class="text-light">I'm a normal text</p>
    <p class="text-primary">I'm a primary text</p>
    <p class="text-secondary">I'm a secondary text</p>
    <p class="text-danger">I'm an error text</p>
    <p class="text-info">I'm an info text</p>
    <p class="text-warning">I'm a warning text</p>
    <code class="">Im' some jinky suspicious code!!</code>



    <table class="table">
      <thead class="thead">
        <tr>
          <th>lololo</th>
        </tr>
      </thead>
      <tr>
        <td>SomeMod</td>
        <td>SomeVersion</td>
      </tr>
    </table>

    <div class="card card-bg-dark">
      <div clas="card-header">SomeMods name</div>
    </div>
  </div>
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
	console.log("Getting mods from backend...");
	//TBI: Currently this is running, whenever the "tab" is visited. Reduce this somehow.
	axios.get("http://api-lwmods.localhost/mods")
		.then((response) => {
			state.mods = response.data;
		})
		.catch((error) => {
			console.log("Error: ", error)
		});
})
</script>
