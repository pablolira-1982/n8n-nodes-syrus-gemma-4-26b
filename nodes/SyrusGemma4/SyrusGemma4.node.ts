import type {
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { SyrusChatModel } from './SyrusChatModel';

export class SyrusGemma4 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Syrus Gemma 4 26B Chat Model',
		name: 'syrusGemma4',
		icon: 'file:syrus.svg',
		group: ['transform'],
		version: 1,
		description: 'Chat Model sub-node for Syrus Gemma 4 26B, connecting directly into n8n AI Agent workflows',
		defaults: {
			name: 'Syrus Gemma 4 26B Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Chat Models'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://github.com/syrus-ai/n8n-nodes-syrus-gemma-4-26b',
					},
				],
			},
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'syrusGemmaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Output Tokens',
						name: 'maxOutputTokens',
						type: 'number',
						default: 8192,
						typeOptions: {
							minValue: 1,
						},
						description: 'Maximum number of tokens to generate. Capacity upper-bound, not a guarantee of output length.',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 1.0,
						typeOptions: {
							minValue: 0.0,
							maxValue: 2.0,
							numberPrecision: 2,
						},
						description: 'Controls randomness. Lower values are more deterministic and repetitive; higher values increase variability.',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						default: 0.95,
						typeOptions: {
							minValue: 0.01,
							maxValue: 1.0,
							numberPrecision: 2,
						},
						description: 'Nucleus sampling threshold: cumulative probability mass for selecting next token candidates.',
					},
					{
						displayName: 'Top K',
						name: 'topK',
						type: 'number',
						default: 40,
						typeOptions: {
							minValue: 1,
						},
						description: 'Restricts next-token candidate pool to the K most probable tokens.',
					},
					{
						displayName: 'Stop Sequences',
						name: 'stopSequences',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						default: '',
						placeholder: '["END", "###"]',
						description: 'JSON array of literal strings that terminate generation when encountered (e.g. ["END", "###"]). Literal substrings, not regular expressions.',
					},
					{
						displayName: 'Request Timeout (ms)',
						name: 'timeoutMs',
						type: 'number',
						default: 60000,
						typeOptions: {
							minValue: 1000,
						},
						description: 'Maximum duration in milliseconds to wait for Syrus API response before aborting.',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('syrusGemmaApi');
		const apiKey = credentials.apiKey as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxOutputTokens?: number;
			temperature?: number;
			topP?: number;
			topK?: number;
			stopSequences?: string;
			timeoutMs?: number;
		};

		let stopSequencesArray: string[] | undefined;
		if (options.stopSequences && typeof options.stopSequences === 'string' && options.stopSequences.trim().length > 0) {
			try {
				const parsed = JSON.parse(options.stopSequences.trim());
				if (Array.isArray(parsed)) {
					stopSequencesArray = parsed.map((s) => String(s)).filter((s) => s.length > 0);
				}
			} catch {
				throw new Error('Stop Sequences must be a valid JSON array of strings, e.g. ["END", "###"]');
			}
		}

		const model = new SyrusChatModel({
			apiKey,
			maxOutputTokens: options.maxOutputTokens ?? 8192,
			temperature: options.temperature ?? 1.0,
			topP: options.topP ?? 0.95,
			topK: options.topK ?? 40,
			stopSequences: stopSequencesArray,
			timeoutMs: options.timeoutMs ?? 60000,
			executeFunctions: this as unknown as any,
		});

		return {
			response: model,
		};
	}
}
