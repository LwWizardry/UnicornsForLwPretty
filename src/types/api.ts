
//Sub-Types:

export interface Action {
	action: string; //The name of this action.
}

//APIResponse types, classes that represent different types of API results:

export interface APIResponse {
	readonly kind: string;
}

export class SuccessfulResponse implements APIResponse {
	readonly kind = 'success';
	
	readonly data: any; //TBI: This should actually be an object... But idk JS/TS.
	
	constructor(data: object) {
		this.data = data;
	}
}

export function isTypeSuccessfulResponse(response: APIResponse): response is SuccessfulResponse {
	return response.kind === 'success';
}

export class FailedResponse implements APIResponse {
	readonly kind = 'failed';
	
	readonly message: string;
	readonly actions: null|Action[];
	
	constructor(message: string, actions: Action[]) {
		this.message = message;
		this.actions = actions;
	}
}

export function isTypeFailedResponse(response: APIResponse): response is FailedResponse {
	return response.kind === 'failed';
}

export class NotImplementedYetResponse implements APIResponse {
	readonly kind = 'notImplemented';
	
	constructor() {
		console.warn('Created a NotImplementedResponse - you got to implement a type for this!');
	}
}

export class DescriptiveInternalErrorResponse implements APIResponse {
	readonly kind = 'internalDescriptive';
	
	readonly message: string;
	
	constructor(message: string) {
		this.message = message;
	}
}

export class UnexpectedInternalErrorResponse implements APIResponse {
	readonly kind = 'internalDescriptive';
	
	readonly clazz: string;
	readonly code: any;
	readonly message: string;
	readonly trace: string;
	
	constructor(clazz: string, code: any, message: string, trace: string) {
		this.clazz = clazz;
		this.code = code;
		this.message = message;
		this.trace = trace;
	}
}