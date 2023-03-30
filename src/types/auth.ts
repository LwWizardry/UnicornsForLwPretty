import { isString, isStringNullable } from "@/helper/jsonValidator";

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

export interface MessageToDelete {
	id: string,
	content: string,
}

export enum LoginState {
	WaitingForPrivacy,
	WaitingForComment,
	WaitingForDeletion,
	LoggedIn,
}

export interface LoginInformation {
	acceptPP: boolean,
	loginState: LoginState,
	serverChallenge: ServerChallenge|null,
	messagesToDelete: MessageToDelete[]|null,
}
