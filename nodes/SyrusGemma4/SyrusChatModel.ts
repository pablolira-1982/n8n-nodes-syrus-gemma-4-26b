import { BaseChatModel, type BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import type { BaseMessage } from '@langchain/core/messages';
import type { ChatResult } from '@langchain/core/outputs';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { mapBaseMessagesToSyrusContents } from './messageMapper';
import { mapSyrusResponseToChatResult } from './responseMapper';
import type { SyrusGenerateRequest, SyrusGenerateResponse, SyrusGenerationConfig } from './transport';

export interface SyrusChatModelFields extends BaseChatModelParams {
	apiKey: string;
	endpointUrl?: string;
	maxOutputTokens?: number;
	temperature?: number;
	topP?: number;
	topK?: number;
	stopSequences?: string[];
	timeoutMs?: number;
	executeFunctions?: IExecuteFunctions;
}

export class SyrusChatModel extends BaseChatModel {
	apiKey: string;
	endpointUrl: string;
	maxOutputTokens?: number;
	temperature?: number;
	topP?: number;
	topK?: number;
	stopSequences?: string[];
	timeoutMs: number;
	executeFunctions?: IExecuteFunctions;

	constructor(fields: SyrusChatModelFields) {
		super(fields);
		this.apiKey = fields.apiKey;
		this.endpointUrl = fields.endpointUrl || 'https://gemma-4-26b.syrus.ia.br/generate';
		this.maxOutputTokens = fields.maxOutputTokens;
		this.temperature = fields.temperature;
		this.topP = fields.topP;
		this.topK = fields.topK;
		this.stopSequences = fields.stopSequences;
		this.timeoutMs = fields.timeoutMs || 60000;
		this.executeFunctions = fields.executeFunctions;
	}

	_llmType(): string {
		return 'syrus_gemma_chat_model';
	}

	async _generate(
		messages: BaseMessage[],
		_options: this['ParsedCallOptions'],
		_runManager?: CallbackManagerForLLMRun,
	): Promise<ChatResult> {
		const contents = mapBaseMessagesToSyrusContents(messages);

		const generationConfig: SyrusGenerationConfig = {};
		if (this.maxOutputTokens !== undefined && this.maxOutputTokens !== null) {
			generationConfig.maxOutputTokens = Number(this.maxOutputTokens);
		}
		if (this.temperature !== undefined && this.temperature !== null) {
			generationConfig.temperature = Number(this.temperature);
		}
		if (this.topP !== undefined && this.topP !== null) {
			generationConfig.topP = Number(this.topP);
		}
		if (this.topK !== undefined && this.topK !== null) {
			generationConfig.topK = Number(this.topK);
		}
		if (Array.isArray(this.stopSequences) && this.stopSequences.length > 0) {
			generationConfig.stopSequences = this.stopSequences.filter((s) => typeof s === 'string' && s.length > 0);
		}

		const requestBody: SyrusGenerateRequest = {
			contents,
			generationConfig,
		};

		let responseData: SyrusGenerateResponse;

		if (this.executeFunctions) {
			// Leverage n8n's native httpRequest helper to benefit from internal proxy, logging & credential isolation
			const response = await this.executeFunctions.helpers.httpRequest({
				method: 'POST' as IHttpRequestMethods,
				url: this.endpointUrl,
				headers: {
					'syrus-api-key': this.apiKey,
					'Content-Type': 'application/json',
				},
				body: requestBody,
				json: true,
				timeout: this.timeoutMs,
			});
			responseData = response as SyrusGenerateResponse;
		} else {
			// Native fetch fallback (useful for standalone unit tests)
			const res = await fetch(this.endpointUrl, {
				method: 'POST',
				headers: {
					'syrus-api-key': this.apiKey,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
				signal: AbortSignal.timeout(this.timeoutMs),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(`Syrus HTTP ${res.status} (${res.statusText}): ${errorText}`);
			}
			responseData = (await res.json()) as SyrusGenerateResponse;
		}

		return mapSyrusResponseToChatResult(responseData);
	}
}
