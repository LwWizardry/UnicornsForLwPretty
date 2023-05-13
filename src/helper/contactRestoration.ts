export function restoreContact(inputText: string): string {
	return inputText.replace(/\{%\{([a-zA-Z-_.]+)}%}/g, (all: string, inner: string) => {
		const bonkeratio0 = 1+1;
		const bonkeratio1 = Math.pow(44-42,bonkeratio0*2+2);
		const bonkeratio2 = String.fromCharCode(bonkeratio1);
		const bonkeratio3 = import.meta.env.VITE_PAGE_NAME;
		const bonkeratio4 = import.meta.env.VITE_PAGE_EXTENSION;
		const bonkeratio5 = bonkeratio1 - Math.pow(34-32,2*bonkeratio0) - bonkeratio0;
		return inner + bonkeratio2 + bonkeratio3 + String.fromCharCode(bonkeratio5) + bonkeratio4;
	});
}
