import { performAPIRequest, performAPIRequestWithSession } from "@/code/apiRequests";
import { APIResponseInvalid, FailedResponse, isTypeFailedResponse, isTypeSuccessfulResponse } from "@/types/api";
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

export async function acceptTermsAndPrivacy() {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
	if (!loginInformation.value.acceptPP || !loginInformation.value.acceptTOS) {
		//This should not be possible. Nevertheless, stop here!
		return;
	}
	
	//Load the challenge session from the server:
	const apiResponse = await performAPIRequest('/auth/login/new?privacy-policy=accept&terms-of-service=accept');
	if(!isTypeSuccessfulResponse(apiResponse)) {
		if (isTypeFailedResponse(apiResponse)) {
			handleFailureResponse(apiResponse);
			return;
		}
		loginInformation.value.apiErrorMessage = apiResponse.getUserString();
		return;
	}
	const response = apiResponse.data;
	if(!isTypeServerChallenge(response)) {
		loginInformation.value.apiErrorMessage = new APIResponseInvalid(response).getUserString();
		return;
	}
	//Clear previous errors, as the last request was successful:
	loginInformation.value.apiErrorMessage = null;
	
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
			return;
		}
		loginInformation.value.apiErrorMessage = apiResponse.getUserString();
		return;
	}
	const response = apiResponse.data;
	if(!isTypeMessagesToDelete(response)) {
		loginInformation.value.apiErrorMessage = new APIResponseInvalid(response).getUserString();
		return;
	}
	//Clear previous errors, as the last request was successful:
	loginInformation.value.apiErrorMessage = null;
	
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
			return;
		}
		loginInformation.value.apiErrorMessage = apiResponse.getUserString();
		return;
	}
	const response = apiResponse.data;
	if(!isTypeLoggedInUser(response)) {
		loginInformation.value.apiErrorMessage = new APIResponseInvalid(response).getUserString();
		return;
	}
	//Clear previous errors, as the last request was successful:
	loginInformation.value.apiErrorMessage = null;
	
	authStore.currentUser = response;
	loginInformation.value.loginState = LoginState.LoggedIn;
}

function handleFailureResponse(response: FailedResponse): void {
	const authStore = useAuthStore(window.__pinia);
	const { loginInformation } = storeToRefs(authStore);
	
	loginInformation.value.apiErrorMessage = 'API reported issue: ' + response.message;
	
	//Handle actions if any:
	if(response.actions === null) {
		return; //Done here, no actions.
	}
	for(const action of response.actions) {
		const name = action.action;
		if(name === "new-session") {
			//Reset state back to privacy policy:
			loginInformation.value.loginState = LoginState.WaitingForTermsAndPrivacy;
			loginInformation.value.serverChallenge = null;
			loginInformation.value.messagesToDelete = null;
			//Pretend the user acknowledged that.
			acceptTermsAndPrivacy();
		} else if(name === "update-comments") {
			const genericAction = action as any; //TBI: Find a better generic way to receive the right type...
			if(!isArrayOfType(genericAction.comments, isTypeMessageToDelete)) {
				//Print to console, for debugging.
				console.error("Server sent malformed/invalid 'comments to delete' update: ", genericAction.comments);
				loginInformation.value.apiErrorMessage = loginInformation.value.apiErrorMessage + ' | API sent malformed comments to update (see console)';
				return;
			}
			loginInformation.value.messagesToDelete = genericAction.comments;
		} else {
			loginInformation.value.apiErrorMessage = loginInformation.value.apiErrorMessage + ' | API sent unknown action: ' + name;
		}
	}
}
