<template>
	<p>To upload mods and add comments, you need to login to the mod portal.</p>
	<p>Logging in is done using your <a href="https://logicworld.net" target="_blank">Logic World</a> account.</p>
	
	<br />
	<p>Logging in with your LW account is an four step process:</p>
	<ol>
		<li>
			Make sure you are logged into your <a href="https://logicworld.net" target="_blank">Logic World</a> account or create one.<br />
			If you loose your credentials (email, password) you will not be able to log in here either, so remember them or write them down!
		</li>
		<li>Open <a href="https://logicworld.net/view/pst-3c6860ea" target="_blank">Mod Portal Registration Thread</a> on Logic Worlds website.</li>
		<li>Create a comment with a <i>challenge message</i> on that thread. Press the confirmation button on this page.</li>
		<li>Delete the comment on that thread which you created just now. Press the confirmation button on this page.</li>
	</ol>
	
	<br />
	<p>By logging in, you agree to our Privacy Policy (that does not exist yet)</p>
	
	<br />
	<p>Instruction:</p>
	<div class="instruction-box">
		<div v-if="state.loginState === LoginState.WaitingForChallenge">
			Server has not yet sent a challenge...
		</div>
		<div v-else-if="state.loginState === LoginState.WaitingForComment">
			<p>Open Logic World Forum Thread <a href="https://logicworld.net/view/pst-3c6860ea" target="_blank">Mod Portal Registration</a> and create a comment with following content:</p>
			<p><span class="challenge-text">{{ state.serverChallenge.challenge }}</span> <button @click="copyToClipboard">Copy!</button></p>
			<br />
			<p>Once done, confirm by pressing this button: <button @click="createdComment">I created that comment!</button></p>
		</div>
		<div v-else-if="state.loginState === LoginState.WaitingForDeletion">
			<div>
				<p>Comments you have to delete:</p>
				<ul>
					<li v-for="message in state.messagesToDelete">
						<a :href="'https://logicworld.net/view/pst-3c6860ea#' + message.id" target="_blank">{{message.content}}</a>
					</li>
				</ul>
			</div>
			<p>Press here to check if all your comments are deleted: <button @click="deletedComment">I deleted all my comments!</button></p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import axios, { AxiosError } from "axios";

enum LoginState {
	WaitingForChallenge,
	WaitingForComment,
	WaitingForDeletion,
	LoggedIn,
}

interface ServerChallenge {
	challenge: string,
	session: string,
}

interface MessageToDelete {
	id: string,
	content: string,
}

const state = reactive({
	loginState: LoginState.WaitingForChallenge,
	serverChallenge: null as ServerChallenge|null,
	messagesToDelete: null as MessageToDelete[]|null,
});

onMounted(() => {
	requestServerChallenge();
});

function copyToClipboard() {
	if(!state.serverChallenge) {
		//Whoops!
		return;
	}
	navigator.clipboard.writeText(state.serverChallenge.challenge);
}

async function requestServerChallenge() {
	//Load the challenge session from the server:
	const remote = import.meta.env.VITE_BACKEND + '/auth/login/new';
	console.log("Performing API request to: ", remote); //TODO: Remove this message eventually.
	try {
		const response = await axios.get(remote);
		//TODO: Validate data sent by server:
		state.serverChallenge = response.data;
		state.loginState = LoginState.WaitingForComment;
	} catch (e) {
		//TODO: Regardless, handle the error visually!
		if(axios.isAxiosError(e)) {
			debugAxiosError(e as AxiosError);
		} else {
			console.error("GenericError: ", e);
		}
	}
}

async function createdComment() {
	if(!state.serverChallenge) {
		//Whoops!
		return;
	}
	const remote = import.meta.env.VITE_BACKEND + '/auth/login/created';
	console.log("Performing API request to: ", remote); //TODO: Remove this message eventually.
	try {
		const response = await axios.get(remote + '?session=' + state.serverChallenge.session);
		//TODO: Validate data sent by server:
		const data = response.data;
		if(data.ok) {
			state.messagesToDelete = response.data.messagesToDelete,
			state.loginState = LoginState.WaitingForDeletion;
		} else {
			const failReason = data.reason;
			if(failReason == "timeout") {
				console.log("Took too long to create the comment, try new challenge!");
			} else if(failReason == "missing") {
				console.log("Could not find the message");
			} else {
				console.error("API returned unknown failure reason for checking comment creation:", failReason);
			}
		}
	} catch (e) {
		//TODO: Regardless, handle the error visually!
		if(axios.isAxiosError(e)) {
			debugAxiosError(e as AxiosError);
		} else {
			console.error("GenericError: ", e);
		}
	}
}

function debugAxiosError(error: AxiosError) {
	if(error.code == AxiosError.ERR_BAD_REQUEST) {
		if(error.message == "Request failed with status code 404") {
			console.error("Server claims that '", error.request.responseURL, "' does not exist and returned a 404 error.");
		} else {
			console.error("Server claims that a bad request has been performed. Detailed message:", error.message);
		}
		return;
	} else if(error.code == AxiosError.ERR_NETWORK) {
		console.error("A generic network access has occurred, more information in console?");
		return;
	}
	console.error("Axios error{ Code: '", error.code, "' Message: '", error.message, "'}");
}

async function deletedComment() {
	if(!state.serverChallenge) {
		//Whoops!
		return;
	}
	const remote = import.meta.env.VITE_BACKEND + '/auth/login/deleted';
	console.log("Performing API request to: ", remote); //TODO: Remove this message eventually.
	try {
		const response = await axios.post(remote, {
			"session": state.serverChallenge.session,
		});
		//TODO: Validate data sent by server:
		const data = response.data;
		if(data.ok) {
			state.messagesToDelete = response.data.messagesToDelete,
				state.loginState = LoginState.WaitingForDeletion;
		} else {
			const failReason = data.reason;
			if(failReason == "timeout") {
				console.log("Took too long to create the comment, try new challenge! (Aka, reload...)");
			} else if(failReason == "missing") {
				console.log("Could not find the message");
			} else {
				console.error("API returned unknown failure reason for checking comment creation:", failReason);
			}
		}
	} catch (e) {
		//TODO: Regardless, handle the error visually!
		if(axios.isAxiosError(e)) {
			debugAxiosError(e as AxiosError);
		} else {
			console.error("GenericError: ", e);
		}
	}
}
</script>

<style scoped>
	.instruction-box {
		border: #aaa solid 1px;
		border-radius: 4px;
		padding: 3px 10px 3px 10px;
	}
	
	.challenge-text {
		font-family: monospace;
		padding: 2px;
		background-color: #333;
	}
	
	/* Just anything to not let me be fully unwell */
	button {
		background-color: #333;
		border: green solid 1px;
		border-radius: 4px;
		color: #aaa;
		padding: 2px 8px 2px 8px;
	}
	button:hover {
		background-color: #555;
		color: #ccc;
	}
	button:active {
		background-color: #444;
		color: #bbb;
	}
</style>