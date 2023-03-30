import { isString, isStringNullable } from "@/helper/jsonValidator";

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
