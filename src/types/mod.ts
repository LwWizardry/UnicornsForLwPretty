import { isArrayOfType, isString } from "@/helper/jsonValidator";

export interface ModSummary {
	identifier: string,
	//TODO: Add optional custom URL identifier.
	title: string,
	caption: string,
	image: null,
	//TODO: Add author or primary maintainer.
}

export function isTypeModSummary(value: any): value is ModSummary {
	return isString(value.title)
		&& isString(value.caption)
		&& isString(value.identifier)
	//TODO: Image, as soon as support for it.
}

export function isTypeModSummaryArray(value: any): value is ModSummary[] {
	return isArrayOfType(value, isTypeModSummary)
}

export interface ModDetails {
	title: string,
	caption: string,
	image: null,
	//TODO: All other relevant fields...
}

export function isTypeModDetails(value: any): value is ModDetails {
	return isString(value.title)
		&& isString(value.caption)
	//TODO: Image, as soon as support for it.
}
