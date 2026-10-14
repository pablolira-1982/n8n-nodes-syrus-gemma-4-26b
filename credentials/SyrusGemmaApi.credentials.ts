import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SyrusGemmaApi implements ICredentialType {
	name = 'syrusGemmaApi';
	displayName = 'Syrus Gemma API';
	documentationUrl = 'https://github.com/syrus-ai/n8n-nodes-syrus-gemma-4-26b';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API key for authenticating with Syrus Gemma 4 26B service (sent via syrus-api-key header)',
		},
	];
}
