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
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import { isTypeLoggedInUser, LoginState } from "@/types/auth";
import { storeToRefs } from "pinia";

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

function updateCommentsToDelete(commentsToDelete: any) {
	if(!commentsToDelete || !(commentsToDelete instanceof Array)) {
		return false;
	}
	for (const comment of commentsToDelete) {
		if(typeof(comment.id) != "string" || typeof(comment.content) != "string") {
			return false;
		}
	}
	
	loginInformation.value.messagesToDelete = commentsToDelete;
	return true;
}

//### STATE-SWITCHER #####

async function acceptPrivacyPolicy() {
	if(!loginInformation.value.acceptPP) {
		//This should not be possible. Nevertheless, stop here!
		return;
	}
	
	//Load the challenge session from the server:
	const response = await performAPIRequest('/auth/login/new?privacy-policy=accept');
	if(!response) {
		return; //Failed!
	}
	//We got a data block!
	if(!response.challenge || !response.session || typeof(response.challenge) != "string" || typeof(response.session) != "string") {
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
	
	const response = await performAPIRequestWithSession('/auth/login/created', loginInformation.value.serverChallenge.session);
	if(!response) {
		return; //Failed!
	}
	//We got a data block!
	
	if(typeof(response.author) != "string") {
		console.error("Weird API data response:", response);
		return;
	}
	if(!updateCommentsToDelete(response.messagesToDelete)) {
		console.error("Weird API data response:", response);
		return;
	}
	loginInformation.value.loginState = LoginState.WaitingForDeletion;
}

async function deletedComment() {
	if(!loginInformation.value.acceptPP || loginInformation.value.loginState != LoginState.WaitingForDeletion || !loginInformation.value.serverChallenge) {
		//Something went terribly wrong, it should not be possible to even trigger this.
		return;
	}
	
	const response = await performAPIRequestWithSession('/auth/login/deleted', loginInformation.value.serverChallenge.session);
	if(!response) {
		return; //Failed!
	}
	//We got a data block!
	
	if(!isTypeLoggedInUser(response)) {
		console.error("Weird API data response:", response);
		return;
	}
	
	authStore.currentUser = response;
	loginInformation.value.loginState = LoginState.LoggedIn;
}

//### API-ACCESS #####

async function performAPIRequestWithSession(path: string, session: string) {
	return await performAPIRequest(path, {
		headers: {
			Authorization: 'Bearer ' + session,
		}
	})
}

async function performAPIRequest(path: string, config?: AxiosRequestConfig) {
	const remote = import.meta.env.VITE_BACKEND + path;
	//console.log("Performing API request to: ", remote);
	try {
		const response = await axios.get(remote, config);
		if(!response.data) {
			//How is there no data?
			console.error("API request yielded " + response.status + " but no content was delivered...");
			//TODO: Notify user of error...
			return undefined;
		}
		//Got a 200 response with content.
		const data = response.data?.data;
		if(!data) {
			//But the expected 'data' block from the API is missing!
			//Check for error/failure:
			debugRequestContent(response.data);
			return undefined;
		}
		//Got data block, forward it:
		return data;
	} catch (e) {
		//Something went wrong!
		if(axios.isAxiosError(e)) {
			debugAxiosError(e as AxiosError);
		} else {
			console.error("Exception was thrown while performing API request.", e);
			//TODO: Notify user of error...
		}
	}
	return undefined;
}

function debugAxiosError(error: AxiosError) {
	if(error.response?.data) {
		//We got a response from the server. Hence, process that instead:
		debugRequestContent(error.response.data);
		return;
	}
	//At this point, the server never sent response content that we could process.
	// Print generic errors:
	
	if(error.code == AxiosError.ERR_NETWORK) {
		console.error("Network error while talking to API. Check console for details!");
		console.error("Full error:", error);
		return;
	}
	
	if(!error.response) {
		//How is this possible? How would axios take care of this?
		// Just dump the whole thing...
		console.log("Received AxiosError without response from the server:", error);
		return;
	}
	
	const response = error.response;
	if(response.status == 404) {
		console.error("Server claims that '" + error.request.responseURL + "' does not exist and returned a 404 error.");
	} else if(response.status == 405) {
		console.error("Server claims that a bad request type has been used on '" + error.request.responseURL + "'.");
	} else {
		console.error("Axios error{ Code: '", error.code, "' Message: '", error.message, "'}");
		console.error("Full error:", error);
	}
}

function debugRequestContent(content: any) {
	if(content.error) {
		const error = content.error;
		if(error.type == "bad-request" && typeof(error.message) == "string") {
			//TODO: Notify user!
			console.error("API returned bad request with message:", error.message);
		} else if(error.type == "internal-descriptive" && typeof(error.message) == "string") {
			//TODO: Notify user!
			console.error("API had internal error with message:", error.message);
		} else if(error.type == "internal"
			&& typeof(error.class) == "string"
			&& typeof(error.code) != "undefined"
			&& typeof(error.message) == "string"
			&& typeof(error["trace"]) == "string"
		) {
			//TODO: Notify user!
			console.error("Backend threw unexpected exception while performing API request:\n",
				error.class, "(", error.code, "):", error.message, "\n\n",
				error.trace
			);
		} else {
			//TODO: Notify user!
			console.error("API returned unknown error:", content.error);
		}
	} else if(content.failure) {
		const failure = content.failure;
		if(failure.actions)
		{
			for (const entry of failure.actions) {
				const action = entry.action;
				if(!action) {
					continue;
				}
				if(action == "new-session") {
					//Reset state back to privacy policy:
					loginInformation.value.loginState = LoginState.WaitingForPrivacy;
					loginInformation.value.serverChallenge = null;
					loginInformation.value.messagesToDelete = null;
					//Pretend the user acknowledged that.
					acceptPrivacyPolicy();
				} else if(action == "update-comments") {
					if(!updateCommentsToDelete(entry.comments)) {
						console.error("Server sent malformed/invalid comments to delete update: ", entry.comments);
					}
				} else {
					//TODO: Notify user!
					console.error("UNKNOWN ACTION:", action);
				}
			}
		}
		if(failure["user-error"] && typeof(failure["user-error"]) == "string") {
			//TODO: Notify user!
			console.error("API returned user error:", failure['user-error']);
		} else {
			//TODO: Notify user!
			console.error("API returned unknown failure:", content.failure);
		}
	} else {
		//Huh?
		console.error("API returned weird content:", content);
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
