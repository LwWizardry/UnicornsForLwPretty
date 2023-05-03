
//Sub-Types:

import { isObject } from "@/helper/jsonValidator";

export interface Action {
	action: string; //The name of this action.
}

//APIResponse types, classes that represent different types of API results:

export interface APIResponse {
	//Explicit separation between "usable" and "drop".
	readonly success: boolean;
}

export type APIResponseTypes = SuccessfulResponse|UnsuccessfulAPIResponse;

//When everything goes well, the server sends a 'data' JSON object.
export class SuccessfulResponse implements APIResponse {
	readonly success = true;
	
	readonly data: any; //TBI: This should actually be an object... But idk JS/TS.
	
	constructor(data: object) {
		this.data = data;
	}
}

export function isTypeSuccessfulResponse(response: APIResponse): response is SuccessfulResponse {
	return response.success;
}

export abstract class UnsuccessfulAPIResponse implements APIResponse {
	readonly success = false;
	
	readonly abstract kind: string;
	
	abstract getUserString(): string;
}

export function isTypeUnsuccessfulAPIResponse(response: APIResponse): response is UnsuccessfulAPIResponse {
	return !response.success;
}

//When a user-error occurs.
export class FailedResponse extends UnsuccessfulAPIResponse {
	readonly kind = 'failed';
	
	readonly message: string;
	readonly actions: null|Action[];
	
	constructor(message: string, actions: Action[]) {
		super();
		this.message = message;
		this.actions = actions;
	}
	
	getUserString(): string {
		return 'API rejected state or data with message: ' + this.message;
	}
}

export function isTypeFailedResponse(response: APIResponse): response is FailedResponse {
	return isTypeUnsuccessfulAPIResponse(response) && response.kind === 'failed';
}

//####################################

//Any type of exception, that is not expected by the front-end:
export abstract class UnexpectedAPIResponse extends UnsuccessfulAPIResponse {}

//Clients "fault":

export class APIClaimsAbuse extends UnexpectedAPIResponse {
	readonly kind = 'abuse';
	
	readonly message: string;
	
	constructor(message: string) {
		super();
		this.message = message;
		//Print this message, so that the information won't get lost:
		console.error(message); //Can be printed as is.
	}
	
	getUserString(): string {
		return this.message;
	}
}

//To be sorted:

export class NotImplementedYetResponse extends UnexpectedAPIResponse {
	readonly kind = 'notImplemented';
	
	constructor() {
		super();
		console.warn('Created a NotImplementedResponse - you got to implement a type for this!');
	}
	
	getUserString(): string {
		return "Something went wrong while calling API, check console for details.";
	}
}

//Servers fault:

export class APIResponseInvalid extends UnexpectedAPIResponse {
	readonly kind = 'invalid-response';
	
	//If the content is 'null' there was no content, this only happens if the API states code 200:
	readonly originalData: null|string;
	
	constructor(originalData: null|any) {
		super();
		this.originalData = enforceString(originalData);
		//Print this message, so that the information won't get lost:
		console.error("Failed to process API data as it is invalid/malformed:", originalData);
	}
	
	getUserString(): string {
		return "API returned an invalid data format. Check console for details.";
	}
}

export class DescriptiveInternalErrorResponse extends UnexpectedAPIResponse {
	readonly kind = 'internalDescriptive';
	
	readonly message: string;
	
	constructor(message: string) {
		super();
		this.message = message;
		//Print this message, so that the information won't get lost:
		console.error("API had internal error with message:", message);
	}
	
	getUserString(): string {
		return this.message;
	}
}

export class UnexpectedInternalErrorResponse extends UnexpectedAPIResponse {
	readonly kind = 'internalDescriptive';
	
	readonly clazz: string;
	readonly code: any;
	readonly message: string;
	readonly trace: string;
	
	constructor(clazz: string, code: any, message: string, trace: string) {
		super();
		this.clazz = clazz;
		this.code = code;
		this.message = message;
		this.trace = trace;
		//Print this message, so that the information won't get lost:
		console.error("Backend threw unexpected exception while performing API request:\n",
			clazz, "(", code, "):", message, "\n\n",
			trace
		);
	}
	
	getUserString(): string {
		return 'Backend threw an unexpected exception, while performing API request. Details in console.';
	}
}

function enforceString(value: any) {
	if(isObject(value)) {
		return JSON.stringify(value);
	} else {
		return String(value);
	}
}