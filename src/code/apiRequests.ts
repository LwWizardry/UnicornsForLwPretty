import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { APIResponseTypes } from "@/types/api";
import {
	APIClaimsAbuse, APIResponseInvalid,
	DescriptiveInternalErrorResponse, FailedResponse,
	NotImplementedYetResponse,
	SuccessfulResponse,
	UnexpectedInternalErrorResponse
} from "@/types/api";
import { isArrayOfType, isObject, isString } from "@/helper/jsonValidator";

export async function performAPIPostWithSession(path: string, session: string, jsonData: any): Promise<APIResponseTypes> {
	const config = {
		headers: {
			Authorization: 'Bearer ' + session,
		}
	}
	const remote = import.meta.env.VITE_BACKEND + path;
	return handleResponse(() => axios.post(remote, jsonData, config));
}

export async function performAPIRequestWithSession(path: string, session: string): Promise<APIResponseTypes> {
	return await performAPIRequest(path, {
		headers: {
			Authorization: 'Bearer ' + session,
		}
	})
}

export async function performAPIRequest(path: string, config?: AxiosRequestConfig): Promise<APIResponseTypes> {
	const remote = import.meta.env.VITE_BACKEND + path;
	return handleResponse(() => axios.get(remote, config));
}

async function handleResponse(call: () => Promise<AxiosResponse<any>>): Promise<APIResponseTypes> {
	try {
		const response = await call();
		if (!response.data) {
			//How is there no data?
			return new APIResponseInvalid(null);
		}
		//Got a 200 response with content.
		const data = response.data?.data;
		if (!data) {
			//But the expected 'data' block from the API is missing!
			//Check for error/failure:
			const ret = debugRequestContent(response.data);
			if(ret === null) {
				return new APIResponseInvalid(data);
			}
			return ret;
		}
		//Got data block, forward it:
		return new SuccessfulResponse(data);
	} catch (e) {
		//Something went wrong!
		if (axios.isAxiosError(e)) {
			return debugAxiosError(e as AxiosError);
		} else {
			//TODO: Implement an exception type, as soon as this happens for the first time.
			console.error("Exception was thrown while performing API request.", e);
			return new NotImplementedYetResponse();
		}
	}
}

function debugAxiosError(error: AxiosError): APIResponseTypes {
	if(error.response) {
		//Server did send a response!
		
		//Check for common (structural) error codes:
		const response = error.response;
		if (response.status == 404) {
			return new APIClaimsAbuse('Server states that endpoint "' + error.request.responseURL + '" does not exist (404).');
		} else if (response.status == 405) {
			return new APIClaimsAbuse('Server states that endpoint "' + error.request.responseURL + '" needs to be accessed with a different "method" (405).');
		}
		
		if(response.data) {
			//There is data sent by the server, lets debug that:
			const ret = debugRequestContent(response.data);
			if(ret === null) {
				return new APIResponseInvalid(JSON.stringify(response.data));
			}
			return ret;
		}
	}
	//At this point, the server never sent response content that we could process.
	
	//Possible network error, due to for example CORS headers (as Server/PHP/DB are offline - or setup error):
	if (error.code == AxiosError.ERR_NETWORK) {
		//TODO: Create class for this type of error, the next time it occurs.
		console.error("Network error while talking to API. Check console for details!");
		console.error("Full error:", error);
		return new NotImplementedYetResponse();
	}
	
	//TODO: Find more specific cases until this code here is potentially pointless.
	//At this point, it is unclear what the error was about, print it in raw:
	console.error("Axios error{ Code: '", error.code, "' Message: '", error.message, "'}");
	console.error("Full error:", error);
	return new NotImplementedYetResponse();
}

function debugRequestContent(content: any): null|APIResponseTypes {
	if (content.error) {
		return debugErrorContent(content.error);
	} else if (content.failure) {
		return debugFailureContent(content.failure);
	}
	return null;
}

function debugErrorContent(error: any): null|APIResponseTypes {
	//The backend sent the 'error' type message, this means something went wrong which under normal conditions should not happen:
	
	//Check the type of the error and parse/handle it appropriately:
	if (error.type == "bad-request" && isString(error.message)) {
		//This error is unexpected and caused by the client. Missing header or similar. Should normally never happen.
		return new APIClaimsAbuse('Server states that endpoint ' + error.request.responseURL + ' is wrongly used: ' + error.message);
	}
	
	if (error.type == "internal-descriptive" && isString(error.message)) {
		//Something went wrong on the server, but it is expected to possibly happen:
		return new DescriptiveInternalErrorResponse(error.message);
	}
	
	if (error.type == "internal"
		&& isString(error.class)
		&& typeof (error.code) != "undefined"
		&& isString(error.message)
		&& isString(error.trace)
	) {
		//An unexpected exception has been thrown on the server:
		return new UnexpectedInternalErrorResponse(error.class, error.code, error.message, error.trace);
	}
	
	//Invalid error message sent by server, escalate:
	return null;
}

function debugFailureContent(failure: any): null|APIResponseTypes {
	//The backend sent a 'failure' type response, expected issues that can occur and can be handled:
	
	//The backend is able to send actions, which are context-sensitive, must be passed to the caller of the API:
	let actions = null;
	if (failure.actions) {
		//Actions exists, validate it's an array of actions:
		if (!isArrayOfType(failure.actions, (entry: any): boolean => {
			return isObject(entry)
				&& isString(entry.action)
		})) {
			//Invalid action, means invalid failure message, escalate:
			return null;
		}
		actions = failure.actions;
	}
	
	//Message that can be shown to the user in any case:
	if (isString(failure["user-error"])) {
		return new FailedResponse(failure['user-error'], actions);
	}
	
	//At this point, the failure message is invalid and cannot be processed. Escalate:
	return null;
}
