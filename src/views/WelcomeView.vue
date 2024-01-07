<template>
	<div class="content">
		<h2>Welcome to the Logic World Community Mod Portal!</h2>
		<p>A website for Logic World modders to upload their <RouterLink to="/mods">mods</RouterLink> for you to find and download!</p>
		<p>Even though modding is not yet officially supported by the game, there are a bunch of mods worth installing!</p>
		<br />
		<p>Also join our <a :href="discordLink">Discord</a> to discuss ideas, ask for help, report bugs, or just to talk about modding :)</p>
		
		<h3>Learn about the development!</h3>
		<p>Just like the official mod support, this website is a work in progress and unfinished!</p>
		<p>Most of the development progress of this website is logged on our <a :href="discordLink">Discord</a></p>
		<br />
		<p>The development phase of this website is split into 3 phases. It is currently in <b>phase 2</b>.</p>
		
		<ul>
			<li>
				<h4>Phase 1: Functionality</h4>
				<p>The website does not work.</p>
				<p>The goal of this phase is, that the base functionality is provided: Uploading and serving mods.</p>
			</li>
			<li>
				<h4>Phase 2: Legal & Security</h4>
				<p>The website is functional and public. But only whitelisted modders may upload content.</p>
				<p>Legal requirements will be implemented, so that everyone can use the website without concerns (and rely on their EU data protection rights).</p>
				<p>Security will be implemented, to protect this website's API and data. Uploading the same mod ID or mod version multiple times will cause issues down the line.</p>
			</li>
			<li>
				<h4>Phase 3: Features</h4>
				<p>The website works and is public to everyone.</p>
				<p>Several missing features like mod categories or comments will be added.</p>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
const discordLink = import.meta.env.VITE_DISCORD_LINK;
</script>

<style scoped>
.content {
	margin-bottom: 2em;
}

h1, h2, h3, h4, h5 {
	margin: 1em 0 0.5em 0;
}
p {
	margin: 0 1em 0 1em;
}
::v-deep(b) {
	font-weight: bold;
}
</style>