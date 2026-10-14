import { describe, it, expect } from 'vitest';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { mapBaseMessagesToSyrusContents } from '../nodes/SyrusGemma4/messageMapper';

describe('messageMapper', () => {
	it('should map HumanMessage to user role', () => {
		const messages = [new HumanMessage('Hello Syrus')];
		const contents = mapBaseMessagesToSyrusContents(messages);

		expect(contents).toEqual([
			{
				role: 'user',
				parts: [{ text: 'Hello Syrus' }],
			},
		]);
	});

	it('should map AIMessage to model role', () => {
		const messages = [new AIMessage('Hello! How can I assist you?')];
		const contents = mapBaseMessagesToSyrusContents(messages);

		expect(contents).toEqual([
			{
				role: 'model',
				parts: [{ text: 'Hello! How can I assist you?' }],
			},
		]);
	});

	it('should prepend SystemMessage to the subsequent user prompt', () => {
		const messages = [
			new SystemMessage('You are a helpful assistant.'),
			new HumanMessage('Who are you?'),
		];
		const contents = mapBaseMessagesToSyrusContents(messages);

		expect(contents).toHaveLength(1);
		expect(contents[0].role).toBe('user');
		expect(contents[0].parts[0].text).toContain('[System Instruction]\nYou are a helpful assistant.');
		expect(contents[0].parts[0].text).toContain('[User Message]\nWho are you?');
	});

	it('should preserve multi-turn history order', () => {
		const messages = [
			new HumanMessage('Question 1'),
			new AIMessage('Answer 1'),
			new HumanMessage('Question 2'),
		];
		const contents = mapBaseMessagesToSyrusContents(messages);

		expect(contents).toHaveLength(3);
		expect(contents[0]).toEqual({ role: 'user', parts: [{ text: 'Question 1' }] });
		expect(contents[1]).toEqual({ role: 'model', parts: [{ text: 'Answer 1' }] });
		expect(contents[2]).toEqual({ role: 'user', parts: [{ text: 'Question 2' }] });
	});
});
