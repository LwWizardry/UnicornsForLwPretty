import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { APIResponse } from "@/types/api";
import {
	DescriptiveInternalErrorResponse, FailedResponse,
	NotImplementedYetResponse,
	SuccessfulResponse,
	UnexpectedInternalErrorResponse
} from "@/types/api";
import { isArrayOfType, isObject, isString } from "@/helper/jsonValidator";

export async function performAPIPostWithSession(path: string, session: string, jsonData: any): Promise<APIResponse> {
	const config = {
		headers: {
			Authorization: 'Bearer ' + session,
		}
	}
	const remote = import.meta.env.VITE_BACKEND + path;
	
	try {
		const response = await axios.post(remote, jsonData, config);
		if (!response.data) {
			//How is there no data?
			console.error("API request yielded " + response.status + " but no content was delivered...");
			//TODO: Notify user of error...
			return new NotImplementedYetResponse();
		}
		//Got a 200 response with content.
		const data = response.data?.data;
		if (!data) {
			//But the expected 'data' block from the API is missing!
			//Check for error/failure:
			return debugRequestContent(response.data);
		}
		//Got data block, forward it:
		return new SuccessfulResponse(data);
	} catch (e) {
		//Something went wrong!
		if (axios.isAxiosError(e)) {
			return debugAxiosError(e as AxiosError);
		} else {
			console.error("Exception was thrown while performing API request.", e);
			//TODO: Notify user of error...
			return new NotImplementedYetResponse();
		}
	}
}

export async function performAPIRequestWithSession(path: string, session: string): Promise<APIResponse> {
	return await performAPIRequest(path, {
		headers: {
			Authorization: 'Bearer ' + session,
		}
	})
}

export async function performAPIRequest(path: string, config?: AxiosRequestConfig): Promise<APIResponse> {
	const remote = import.meta.env.VITE_BACKEND + path;
	//console.log("Performing API request to: ", remote);
	
	try {
		const response = await axios.get(remote, config);
		if (!response.data) {
			//How is there no data?
			console.error("API request yielded " + response.status + " but no content was delivered...");
			//TODO: Notify user of error...
			return new NotImplementedYetResponse();
		}
		//Got a 200 response with content.
		const data = response.data?.data;
		if (!data) {
			//But the expected 'data' block from the API is missing!
			//Check for error/failure:
			return debugRequestContent(response.data);
		}
		//Got data block, forward it:
		return new SuccessfulResponse(data);
	} catch (e) {
		//Something went wrong!
		if (axios.isAxiosError(e)) {
			return debugAxiosError(e as AxiosError);
		} else {
			console.error("Exception was thrown while performing API request.", e);
			//TODO: Notify user of error...
			return new NotImplementedYetResponse();
		}
	}
}

function debugAxiosError(error: AxiosError): APIResponse {
	if (error.response?.data) {
		//We got a response from the server. Hence, process that instead:
		return debugRequestContent(error.response.data);
	}
	//At this point, the server never sent response content that we could process.
	// Print generic errors:
	
	if (error.code == AxiosError.ERR_NETWORK) {
		console.error("Network error while talking to API. Check console for details!");
		console.error("Full error:", error);
		return new NotImplementedYetResponse();
	}
	
	if (!error.response) {
		//How is this possible? How would axios take care of this?
		// Just dump the whole thing...
		console.log("Received AxiosError without response from the server:", error);
		return new NotImplementedYetResponse();
	}
	
	const response = error.response;
	if (response.status == 404) {
		console.error("Server claims that '" + error.request.responseURL + "' does not exist and returned a 404 error.");
		return new NotImplementedYetResponse();
	} else if (response.status == 405) {
		console.error("Server claims that a bad request type has been used on '" + error.request.responseURL + "'.");
		return new NotImplementedYetResponse();
	} else {
		console.error("Axios error{ Code: '", error.code, "' Message: '", error.message, "'}");
		console.error("Full error:", error);
		return new NotImplementedYetResponse();
	}
}

function debugRequestContent(content: any): APIResponse {
	if (content.error) {
		//The backend sent the 'error' type message, this means something went wrong which under normal conditions should not happen:
		const error = content.error;
		//Check the type of the error and parse/handle it appropriately:
		if (error.type == "bad-request" && isString(error.message)) {
			//TODO: Notify user!
			console.error("API returned bad request with message:", error.message);
			//This error is unexpected and caused by the client. Missing header or similar. Should normally never happen.
			return new NotImplementedYetResponse();
		} else if (error.type == "internal-descriptive" && isString(error.message)) {
			//TODO: Notify user!
			console.error("API had internal error with message:", error.message);
			//Something went wrong on the server, but it is expected to possibly happen:
			return new DescriptiveInternalErrorResponse(error.message);
		} else if (error.type == "internal"
			&& isString(error.class)
			&& typeof (error.code) != "undefined"
			&& isString(error.message)
			&& isString(error.trace)
		) {
			//TODO: Notify user!
			console.error("Backend threw unexpected exception while performing API request:\n",
				error.class, "(", error.code, "):", error.message, "\n\n",
				error.trace
			);
			//An unexpected exception has been thrown on the server:
			return new UnexpectedInternalErrorResponse(error.class, error.code, error.message, error.trace);
		} else {
			//TODO: Notify user!
			console.error("API returned unknown error:", content.error);
			//Server sent an unknown error type... Nice should never happen!
			return new NotImplementedYetResponse();
		}
	} else if (content.failure) {
		//The backend sent a 'failure' type response, expected issues that can occur and can be handled:
		const failure = content.failure;
		//The backend is able to send actions, which are context-sensitive, must be passed to the caller of the API:
		let actions = null;
		if (failure.actions) {
			//Actions exists, validate it's an array of actions:
			if (!isArrayOfType(failure.actions, (entry: any): boolean => {
				return isObject(entry)
					&& isString(entry.action)
			})) {
				console.error("API returned weird content:", content);
				return new NotImplementedYetResponse();
			}
			actions = failure.actions;
		}
		//Message that can be shown to the user in any case:
		if (isString(failure["user-error"])) {
			//TODO: Notify user!
			console.error("API returned user error:", failure['user-error']);
			return new FailedResponse(failure['user-error'], actions);
		}
		
		//This failure message is invalid, as it did not contain a user-error message:
		//TODO: Notify user!
		console.error("API returned unknown failure:", content.failure);
		throw new NotImplementedYetResponse();
	} else {
		//Responses are expected to either have 'data' 'failure' or 'error' as properties, if non is there, its malformed:
		console.error("API returned weird content:", content);
		return new NotImplementedYetResponse();
	}
}