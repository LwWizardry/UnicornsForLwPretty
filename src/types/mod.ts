import { isArrayOfType, isIntegerUnsigned, isString, isStringNullable } from "@/helper/jsonValidator";

export interface LWUser {
	id: string,
	name: string,
	picture: null|string,
}

export function isTypeLWUserOptional(value: any): value is null|LWUser {
	if(value === null) {
		return true;
	}
	return isIntegerUnsigned(value.id)
		&& isString(value.name)
		&& isStringNullable(value.picture)
}

export class MPUser {
	identifier: string;
	lw_data: null|LWUser;
	
	constructor(identifier: string, lw_data: LWUser | null) {
		this.identifier = identifier;
		this.lw_data = lw_data;
	}
	
	getDisplayName() {
		return this.lw_data !== null ? this.lw_data.name : this.identifier;
	}
}

export function isTypeMPUser(value: any): value is MPUser {
	return isString(value.identifier)
		&& isTypeLWUserOptional(value.lw_data)
}

export interface ModSummary {
	identifier: string,
	//TODO: Add optional custom URL identifier.
	title: string,
	caption: string,
	image: null,
	owner: MPUser,
}

export function isTypeModSummary(value: any): value is ModSummary {
	return isString(value.title)
		&& isString(value.caption)
		&& isString(value.identifier)
		&& isTypeMPUser(value.owner)
	//TODO: Image, as soon as support for it.
}

export function parseTypeModSummary(value: ModSummary) {
	let mutation = value;
	mutation.owner = new MPUser(value.owner.identifier, value.owner.lw_data);
	return mutation;
}

export function isTypeModSummaryArray(value: any): value is ModSummary[] {
	return isArrayOfType(value, isTypeModSummary)
}

export function parseTypeModSummaryArray(value: ModSummary[]) {
	let newArray = [];
	for(const entry of value) {
		newArray.push(parseTypeModSummary(entry));
	}
	return newArray;
}

export interface ModSummaryAnonym {
	identifier: string,
	//TODO: Add optional custom URL identifier.
	title: string,
	caption: string,
	image: null,
}

export function isTypeModSummaryAnonym(value: any): value is ModSummaryAnonym {
	return isString(value.title)
		&& isString(value.caption)
		&& isString(value.identifier)
	//TODO: Image, as soon as support for it.
}

export function isTypeModSummaryAnonymArray(value: any): value is ModSummaryAnonym[] {
	return isArrayOfType(value, isTypeModSummaryAnonym)
}

export interface ModDetails {
	//Summary types:
	identifier: string,
	//TODO: Add optional custom URL identifier.
	title: string,
	caption: string,
	image: null,
	owner: MPUser,
	//Non-summary types:
	description: string,
	linkSourceCode: null|string,
}

export function isTypeModDetailsOptional(value: any): value is ModDetails {
	if(value === null) {
		return true;
	}
	return isString(value.title)
		&& isString(value.caption)
		&& isString(value.identifier)
		&& isTypeMPUser(value.owner)
		&& isString(value.description)
		&& isStringNullable(value.linkSourceCode)
}

export function parseTypeModDetailsOptional(value: ModDetails) {
	if(value === null) {
		return null;
	}
	let mutation = value;
	mutation.owner = new MPUser(value.owner.identifier, value.owner.lw_data);
	return mutation;
}
