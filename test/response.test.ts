import { describe, it, expect } from 'vitest';
import { mapSyrusResponseToChatResult } from '../nodes/SyrusGemma4/responseMapper';
import type { SyrusGenerateResponse } from '../nodes/SyrusGemma4/transport';

describe('responseMapper', () => {
	it('should correctly parse standard Syrus candidate response', () => {
		const mockResponse: SyrusGenerateResponse = {
			candidates: [
				{
					content: {
						role: 'model',
						parts: [{ text: 'Here is the Syrus Gemma 4 response.' }],
					},
					finishReason: 'STOP',
				},
			],
			usageMetadata: {
				promptTokenCount: 15,
				candidatesTokenCount: 22,
				totalTokenCount: 37,
			},
		};

		const result = mapSyrusResponseToChatResult(mockResponse);

		expect(result.generations).toHaveLength(1);
		expect(result.generations[0].text).toBe('Here is the Syrus Gemma 4 response.');
		expect(result.generations[0].message.content).toBe('Here is the Syrus Gemma 4 response.');
		expect(result.generations[0].generationInfo?.finishReason).toBe('STOP');
		expect(result.llmOutput?.tokenUsage).toEqual({
			promptTokens: 15,
			completionTokens: 22,
			totalTokens: 37,
		});
	});

	it('should throw descriptive error when Syrus API returns error object', () => {
		const errorResponse: SyrusGenerateResponse = {
			error: {
				code: 401,
				message: 'Invalid API Key provided',
				status: 'UNAUTHENTICATED',
			},
		};

		expect(() => mapSyrusResponseToChatResult(errorResponse)).toThrowError(
			'Syrus API Error (401): Invalid API Key provided'
		);
	});

	it('should expose Gemini function calls as LangChain tool calls', () => {
		const result = mapSyrusResponseToChatResult({
			candidates: [{
				content: {
					role: 'model',
					parts: [{ functionCall: { name: 'lookup', args: { city: 'Lisbon' } } }],
				},
			}],
		});

		expect(result.generations[0].message).toMatchObject({
			tool_calls: [{
				name: 'lookup',
				args: { city: 'Lisbon' },
				id: 'lookup-0',
			}],
		});
	});
});
