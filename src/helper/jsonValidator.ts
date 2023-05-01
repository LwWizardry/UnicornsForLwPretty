
export function isObject(data: any): boolean {
	return data !== null && typeof (data) === "object";
}

export function isString(data: any): boolean {
	return typeof (data) === "string";
}

export function isIntegerUnsigned(data: any): boolean {
	return Number.isInteger(data) && data >= 0;
}

export function isStringNullable(data: any): boolean {
	return data === null || typeof (data) === "string";
}

export function isArrayOfType(data: any, validator: (entry: any) => boolean): boolean {
	if(data === null || !(data instanceof Array)) {
		return false;
	}
	//Ensured that we got a non-null array!
	for(const entry of data) {
		if(!validator(entry)) {
			return false;
		}
	}
	//Every entry in the array, matches what the validator defined.
	return true;
}
