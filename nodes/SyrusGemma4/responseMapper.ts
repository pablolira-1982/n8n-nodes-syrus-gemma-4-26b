import { AIMessage } from '@langchain/core/messages';
import type { ChatGeneration, ChatResult } from '@langchain/core/outputs';
import type { SyrusGenerateResponse } from './transport';

/**
 * Parses Syrus API response body and converts it into a standard LangChain ChatResult.
 */
export function mapSyrusResponseToChatResult(response: SyrusGenerateResponse): ChatResult {
	if (response.error) {
		const msg = response.error.message || response.error.status || 'Unknown error from Syrus API';
		throw new Error(`Syrus API Error (${response.error.code || 'UNKNOWN'}): ${msg}`);
	}

	let outputText = '';

	// Google / Gemma format candidates[0].content.parts[0].text
	if (response.candidates && response.candidates.length > 0) {
		const candidate = response.candidates[0];
		if (candidate.content && Array.isArray(candidate.content.parts)) {
			outputText = candidate.content.parts.map((p) => p.text || '').join('');
		}
	} else if (typeof response.text === 'string') {
		outputText = response.text;
	}

	const toolCalls = response.candidates?.[0]?.content?.parts
		?.filter((part) => part.functionCall)
		.map((part, index) => ({
			name: part.functionCall!.name,
			args: part.functionCall!.args ?? {},
			id: `${part.functionCall!.name}-${index}`,
			type: 'tool_call' as const,
		}));

	const message = new AIMessage({
		content: outputText,
		...(toolCalls && toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
	});

	const generations: ChatGeneration[] = [
		{
			text: outputText,
			message,
			generationInfo: {
				finishReason: response.candidates?.[0]?.finishReason,
				usage: response.usageMetadata,
			},
		},
	];

	return {
		generations,
		llmOutput: {
			tokenUsage: response.usageMetadata
				? {
						promptTokens: response.usageMetadata.promptTokenCount,
						completionTokens: response.usageMetadata.candidatesTokenCount,
						totalTokens: response.usageMetadata.totalTokenCount,
					}
				: undefined,
		},
	};
}
