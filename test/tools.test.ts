import { describe, expect, it } from 'vitest';
import { SyrusChatModel } from '../nodes/SyrusGemma4/SyrusChatModel';

describe('SyrusChatModel tool contract', () => {
	it('exposes bindTools so n8n Tools Agent accepts the model', () => {
		const model = new SyrusChatModel({ apiKey: 'test-only' });
		const bound = model.bindTools([
			{
				type: 'function',
				function: {
					name: 'lookup',
					description: 'Look up a city',
					parameters: { type: 'object', properties: { city: { type: 'string' } } },
				},
			},
		]);

		expect(typeof model.bindTools).toBe('function');
		expect(bound).toBeDefined();
	});
});
