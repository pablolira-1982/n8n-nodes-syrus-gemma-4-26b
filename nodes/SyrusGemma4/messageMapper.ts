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
			const toolCalls = (message as BaseMessage & {
				tool_calls?: Array<{ name: string; args?: Record<string, unknown> }>;
			}).tool_calls;
			contents.push({
				role: 'model',
				parts: toolCalls?.length
					? toolCalls.map((call) => ({ functionCall: { name: call.name, args: call.args ?? {} } }))
					: [{ text: textContent }],
			});
		} else if (type === 'tool') {
			const toolMessage = message as BaseMessage & { name?: string; tool_call_id?: string };
			contents.push({
				role: 'user',
				parts: [{
					functionResponse: {
						name: toolMessage.name || toolMessage.tool_call_id || 'tool',
						response: textContent,
					},
				}],
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
