import { performAPIRequest, performAPIRequestWithSession } from "@/code/apiRequests";
import { FailedResponse, isTypeFailedResponse, isTypeSuccessfulResponse } from "@/types/api";
import {
	isTypeLoggedInUser,
	isTypeMessagesToDelete,
	isTypeMessageToDelete,
	isTypeServerChallenge,
	LoginState
} from "@/types/auth";
import { isArrayOfType } from "@/helper/jsonValidator";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

export async function acceptPrivacyPolicy() {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
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

export async function createdComment() {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
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

export async function deletedComment() {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
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

function handleFailureResponse(response: FailedResponse): void {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
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
