import { isArrayOfType, isString, isStringNullable } from "@/helper/jsonValidator";

//Types used to store user information:

export interface LoggedInUser {
	token: string,
	identifier: string,
	username: string,
	picture: null | string,
}

export function isTypeLoggedInUser(data: any): data is LoggedInUser {
	return isString(data.token)
		&& isString(data.identifier)
		&& isString(data.username)
		&& isStringNullable(data.picture)
}

//Types used for login procedure:

export interface ServerChallenge {
	challenge: string,
	session: string,
}

export function isTypeServerChallenge(value: any): value is ServerChallenge {
	return isString(value.challenge)
		&& isString(value.session)
}

export interface MessagesToDelete {
	author: string;
	messagesToDelete: MessageToDelete[];
}

export function isTypeMessagesToDelete(value: any): value is MessagesToDelete {
	return isString(value.author)
		&& isArrayOfType(value.messagesToDelete, isTypeMessageToDelete)
}

export interface MessageToDelete {
	id: string,
	content: string,
}

export function isTypeMessageToDelete(value: any): value is MessageToDelete {
	return isString(value.id)
		&& isString(value.content)
}

export enum LoginState {
	WaitingForTermsAndPrivacy,
	WaitingForComment,
	WaitingForDeletion,
	LoggedIn,
}

export interface LoginInformation {
	acceptPP: boolean,
	acceptTOS: boolean,
	loginState: LoginState,
	serverChallenge: ServerChallenge|null,
	messagesToDelete: MessageToDelete[]|null,
	apiErrorMessage: null|string,
}
