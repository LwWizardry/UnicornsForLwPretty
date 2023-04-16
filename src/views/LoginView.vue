<template>
	<p>To upload mods and add comments, you need to login to the mod portal.</p>
	<p>Logging in is done using your <a href="https://logicworld.net" target="_blank">Logic World</a> account.</p>
	
	<br />
	<p>Logging in with your LW account is a three step process:</p>
	<ol>
		<li>
			Accept the privacy policy. Press 'Continue'.
			<span class="check" v-if="loginInformation.loginState > LoginState.WaitingForTermsAndPrivacy">✓</span>
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
		<div v-if="loginInformation.loginState === LoginState.WaitingForTermsAndPrivacy">
			<p><input type="checkbox" v-model="loginInformation.acceptTOS"> I accept the <a href="/terms" target="_blank">Terms of Service</a> (required)</p>
			<p><input type="checkbox" v-model="loginInformation.acceptPP"> I accept the <a href="/privacy" target="_blank">Privacy Policy</a> (required)</p>
			<br />
			<button :disabled="!loginInformation.acceptPP || !loginInformation.acceptTOS" @click="acceptTermsAndPrivacy" class="custom-button-style">Continue</button>
		</div>
		<div v-else-if="loginInformation.loginState === LoginState.WaitingForComment">
			<p>Open Logic World Forum Thread <a href="https://logicworld.net/view/pst-3c6860ea" target="_blank">Mod Portal Registration</a> and create a comment with following content:</p>
			<p><span class="challenge-text">{{ loginInformation.serverChallenge?.challenge }}</span> <button @click="copyToClipboard" class="custom-button-style">Copy!</button></p>
			<br />
			<p>For your own safety: <b>Do not edit the comment containing your challenge</b> (reload this page if you messed up).</p>
			<br />
			<button @click="createdComment" class="custom-button-style">Continue</button>
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
			<button @click="deletedComment" class="custom-button-style">Continue</button>
		</div>
		<div v-else-if="loginInformation.loginState === LoginState.LoggedIn">
				<p>You are logged in!</p>
		</div>
	</div>
	<br />
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { LoginState } from "@/types/auth";
import { storeToRefs } from "pinia";
import { acceptTermsAndPrivacy, createdComment, deletedComment } from "@/code/login";

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
</style>
