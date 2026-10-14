export interface SyrusPart {
	text: string;
}

export interface SyrusContent {
	role: 'user' | 'model';
	parts: SyrusPart[];
}

export interface SyrusGenerationConfig {
	maxOutputTokens?: number;
	temperature?: number;
	topP?: number;
	topK?: number;
	stopSequences?: string[];
}

export interface SyrusGenerateRequest {
	contents: SyrusContent[];
	generationConfig?: SyrusGenerationConfig;
}

export interface SyrusCandidate {
	content?: {
		role?: string;
		parts?: Array<{ text?: string }>;
	};
	finishReason?: string;
	index?: number;
}

export interface SyrusUsageMetadata {
	promptTokenCount?: number;
	candidatesTokenCount?: number;
	totalTokenCount?: number;
}

export interface SyrusGenerateResponse {
	candidates?: SyrusCandidate[];
	usageMetadata?: SyrusUsageMetadata;
	text?: string;
	error?: {
		code?: number;
		message?: string;
		status?: string;
	};
}
