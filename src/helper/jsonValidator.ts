export function isString(data: any): boolean {
	return typeof (data) === "string";
}

export function isStringNullable(data: any): boolean {
	return data === null || typeof (data) === "string";
}
