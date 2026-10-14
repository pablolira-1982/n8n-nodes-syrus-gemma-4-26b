import type { BaseMessage } from '@langchain/core/messages';
import type { SyrusContent } from './transport';

/**
 * Maps LangChain messages into Syrus API `contents` array.
 * Syrus expects roles 'user' and 'model'.
 * System messages are prepended to user prompt as instruction context.
 */
export function mapBaseMessagesToSyrusContents(messages: BaseMessage[]): SyrusContent[] {
	const contents: SyrusContent[] = [];
	let pendingSystemPrompt = '';

	for (const message of messages) {
		const textContent = typeof message.content === 'string'
			? message.content
			: Array.isArray(message.content)
				? message.content.map((c) => (typeof c === 'string' ? c : JSON.stringify(c))).join('\n')
				: String(message.content || '');

		const type = message._getType();

		if (type === 'system') {
			pendingSystemPrompt += (pendingSystemPrompt ? '\n\n' : '') + `[System Instruction]\n${textContent}`;
		} else if (type === 'human') {
			let text = textContent;
			if (pendingSystemPrompt) {
				text = `${pendingSystemPrompt}\n\n[User Message]\n${text}`;
				pendingSystemPrompt = '';
			}
			contents.push({
				role: 'user',
				parts: [{ text }],
			});
		} else if (type === 'ai') {
			contents.push({
				role: 'model',
				parts: [{ text: textContent }],
			});
		} else {
			// Generic fallback (function/tool/chat)
			contents.push({
				role: 'user',
				parts: [{ text: textContent }],
			});
		}
	}

	// If there were only system messages and no following user message
	if (pendingSystemPrompt && contents.length === 0) {
		contents.push({
			role: 'user',
			parts: [{ text: pendingSystemPrompt }],
		});
	}

	return contents;
}
