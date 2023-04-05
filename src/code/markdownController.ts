// @ts-ignore //TBI: It works, I do not know/understand the problem. Do not disturb IDE. But figure out the warning in future.
import MarkdownIt from 'markdown-it';

export class MarkdownController {
	mainInstance: MarkdownIt;
	
	constructor() {
		//Create default markdown instance - for now.
		this.mainInstance = new MarkdownIt();
	}
	
	render(content: string): any {
		return this.mainInstance.render(content);
	}
}
