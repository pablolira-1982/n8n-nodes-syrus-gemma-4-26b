export interface SyrusPart {
	text?: string;
	functionCall?: {
		name: string;
		args?: Record<string, unknown>;
	};
	functionResponse?: {
		name: string;
		response: unknown;
	};
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

export interface SyrusFunctionDeclaration {
	name: string;
	description?: string;
	parameters?: Record<string, unknown>;
}

export interface SyrusTool {
	functionDeclarations: SyrusFunctionDeclaration[];
}

export interface SyrusGenerateRequest {
	contents: SyrusContent[];
	generationConfig?: SyrusGenerationConfig;
	tools?: SyrusTool[];
}

export interface SyrusCandidate {
	content?: {
		role?: string;
		parts?: SyrusPart[];
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
