<template>
	<p>To upload mods and add comments, you need to login to the mod portal.</p>
	<p>Logging in is done using your <a href="https://logicworld.net" target="_blank">Logic World</a> account.</p>
	
	<br />
	<p>Logging in with your LW account is a three step process:</p>
	<ol>
		<li>
			Accept the privacy policy. Press 'Continue'.
			<span class="check" v-if="loginInformation.loginState > LoginState.WaitingForPrivacy">✓</span>
		</li>
		<li>
			<ul>
				<li>
					<p>Make sure you are logged into your <a href="https://logicworld.net" target="_blank">Logic World</a> account or create one.</p>
					<p>If you loose your credentials (email, password) you will not be able to log in here either, so remember them or write them down!</p>
				</li>
				<li>
					<p>Open <a href="https://logicworld.net/view/pst-3c6860ea" target="_blank">Mod Portal Registration Thread</a> on the Logic Worlds website.</p>
				</li>
				<li>
					<p>
						Create a comment with a '<i>challenge message</i>' on that thread. Press 'Continue'.
						<span class="check" v-if="loginInformation.loginState > LoginState.WaitingForComment">✓</span>
					</p>
				</li>
			</ul>
		</li>
		<li>
			Delete the comment on that thread which you created just now. Press 'Continue' to finish the log in.
			<span class="check" v-if="loginInformation.loginState > LoginState.WaitingForDeletion">✓</span>
		</li>
	</ol>
	
	<br />
	<p>Instruction:</p>
	<div class="instruction-box">
		<div v-if="loginInformation.loginState === LoginState.WaitingForPrivacy">
			<p><input type="checkbox" v-model="loginInformation.acceptPP"> I accept the <a href="/privacy-policy" target="_blank">Privacy Policy</a> (required)</p>
			<br />
			<button :disabled="!loginInformation.acceptPP" @click="acceptPrivacyPolicy">Continue</button>
		</div>
		<div v-else-if="loginInformation.loginState === LoginState.WaitingForComment">
			<p>Open Logic World Forum Thread <a href="https://logicworld.net/view/pst-3c6860ea" target="_blank">Mod Portal Registration</a> and create a comment with following content:</p>
			<p><span class="challenge-text">{{ loginInformation.serverChallenge?.challenge }}</span> <button @click="copyToClipboard">Copy!</button></p>
			<br />
			<p>For your own safety: <b>Do not edit the comment containing your challenge</b> (reload this page if you messed up).</p>
			<br />
			<button @click="createdComment">Continue</button>
		</div>
		<div v-else-if="loginInformation.loginState === LoginState.WaitingForDeletion">
			<div>
				<p>Comments you have to delete:</p>
				<ul>
					<li v-for="message in loginInformation.messagesToDelete">
						<a :href="'https://logicworld.net/view/pst-3c6860ea#' + message.id" target="_blank">{{message.content}}</a>
					</li>
				</ul>
			</div>
			<br />
			<button @click="deletedComment">Continue</button>
		</div>
		<div v-else-if="loginInformation.loginState === LoginState.LoggedIn">
				<p>You are logged in!</p>
		</div>
	</div>
	<br />
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import {
	isTypeLoggedInUser,
	isTypeMessagesToDelete, isTypeMessageToDelete,
	isTypeServerChallenge,
	LoginState
} from "@/types/auth";
import { storeToRefs } from "pinia";
import { performAPIRequest, performAPIRequestWithSession } from "@/code/apiRequests";
import { FailedResponse, isTypeFailedResponse, isTypeSuccessfulResponse } from "@/types/api";
import { isArrayOfType } from "@/helper/jsonValidator";

//### STATE #####

const authStore = useAuthStore();
const { loginInformation } = storeToRefs(authStore);

//### HELPERS #####

function copyToClipboard() {
	if(!loginInformation.value.serverChallenge) {
		//Whoops!
		return;
	}
	navigator.clipboard.writeText(loginInformation.value.serverChallenge.challenge);
}

//### STATE-SWITCHER #####

async function acceptPrivacyPolicy() {
	if (!loginInformation.value.acceptPP) {
		//This should not be possible. Nevertheless, stop here!
		return;
	}
	
	//Load the challenge session from the server:
	const apiResponse = await performAPIRequest('/auth/login/new?privacy-policy=accept');
	if(!isTypeSuccessfulResponse(apiResponse)) {
		if (isTypeFailedResponse(apiResponse)) {
			handleFailureResponse(apiResponse);
		}
		return; //Failed!
	}
	const response = apiResponse.data;
	//We got a data block!
	if(!isTypeServerChallenge(response)) {
		console.error("API returned nonsense:", response);
		//TODO: notify user of issue!
	}
	
	loginInformation.value.serverChallenge = response;
	loginInformation.value.loginState = LoginState.WaitingForComment;
}

async function createdComment() {
	if(!loginInformation.value.acceptPP || loginInformation.value.loginState != LoginState.WaitingForComment || !loginInformation.value.serverChallenge) {
		//Something went terribly wrong, it should not be possible to even trigger this.
		return;
	}
	
	const apiResponse = await performAPIRequestWithSession('/auth/login/created', loginInformation.value.serverChallenge.session);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		if (isTypeFailedResponse(apiResponse)) {
			handleFailureResponse(apiResponse);
		}
		return; //Failed!
	}
	const response = apiResponse.data;
	//We got a data block!
	
	if(!isTypeMessagesToDelete(response)) {
		console.error("Weird API data response:", response);
		return;
	}
	
	loginInformation.value.messagesToDelete = response.messagesToDelete;
	loginInformation.value.loginState = LoginState.WaitingForDeletion;
}

async function deletedComment() {
	if(!loginInformation.value.acceptPP || loginInformation.value.loginState != LoginState.WaitingForDeletion || !loginInformation.value.serverChallenge) {
		//Something went terribly wrong, it should not be possible to even trigger this.
		return;
	}
	
	const apiResponse = await performAPIRequestWithSession('/auth/login/deleted', loginInformation.value.serverChallenge.session);
	if(!isTypeSuccessfulResponse(apiResponse)) {
		if (isTypeFailedResponse(apiResponse)) {
			handleFailureResponse(apiResponse);
		}
		return; //Failed!
	}
	const response = apiResponse.data;
	//We got a data block!
	
	if(!isTypeLoggedInUser(response)) {
		console.error("Weird API data response:", response);
		return;
	}
	
	authStore.currentUser = response;
	loginInformation.value.loginState = LoginState.LoggedIn;
}

//### API-ACCESS #####

function handleFailureResponse(response: FailedResponse): void {
	//TODO: Print message somewhere else than console!
	//Handle actions if any:
	if(response.actions === null) {
		return; //Done here, no actions.
	}
	for(const action of response.actions) {
		const name = action.action;
		if(name === "new-session") {
			//Reset state back to privacy policy:
			loginInformation.value.loginState = LoginState.WaitingForPrivacy;
			loginInformation.value.serverChallenge = null;
			loginInformation.value.messagesToDelete = null;
			//Pretend the user acknowledged that.
			acceptPrivacyPolicy();
		} else if(name === "update-comments") {
			const genericAction = action as any; //TBI: Find a better generic way to receive the right type...
			if(!isArrayOfType(genericAction.comments, isTypeMessageToDelete)) {
				console.error("Server sent malformed/invalid comments to delete update: ", genericAction.comments);
			}
			loginInformation.value.messagesToDelete = genericAction.comments;
		} else {
			//TODO: Notify user!
			console.error("UNKNOWN ACTION:", action);
		}
	}
}

</script>

<style scoped>
	b {
		color: #ddd;
	}

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
	button:disabled {
		background-color: #222;
		border-color: #040;
	}
</style>
