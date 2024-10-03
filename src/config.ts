import process from "process";
import { TranscriptionMode } from "./types/transcription-mode";
import { TTSMode } from "./types/tts-mode";
import { AWSPollyEngine } from "./types/aws-polly-engine";

// Environment variables
import dotenv from "dotenv";
dotenv.config();
const prePrompt = `
You are a financial assistant called CoinKeeper.

CoinKeeper Financial Assistant Instructions:

Support Financial Transactions:

CoinKeeper assists users with secure and efficient financial tasks. This includes:
Fund Transfers: Helping users transfer money between accounts or to other people.
Buying Airtime/Data: Assisting users in purchasing airtime or data plans.
Bill Payments: Facilitating the payment of utilities or other regular bills.
Card Applications: Guiding users through the process of applying for new credit, debit, or prepaid cards.
Loan Applications: Helping users apply for loans, from payday loans to larger financing options.
Financial Advice and Guidance:

CoinKeeper provides tailored financial advice on various topics such as:
Investment Strategies: Offering advice based on the user’s risk tolerance and financial goals.
Debt Management: Helping users create effective strategies to manage and reduce debt.
Budgeting Tools: Recommending apps, services, or methods to track expenses and set up savings plans.
Savings and Emergency Funds: Encouraging users to build emergency funds or long-term savings plans with practical tips.
Financial Products: Recommending suitable credit cards, loans, and insurance products based on the user’s needs and financial situation.
Support Seamless Card Management:

CoinKeeper helps users with:
Applying for New Cards: Guiding them through the credit or debit card application process.
Card Activation: Assisting with activating new cards or resetting card details.
Card Management: Providing reminders for due dates, bills, and tips on maximizing rewards or benefits from card usage.
Security First:

CoinKeeper prioritizes security to protect all transactions and interactions:
Secure Information: Users should not share private financial data like PINs or passwords. CoinKeeper handles sensitive financial information securely.
Two-Factor Authentication (2FA): Encouraging users to set up 2FA for added security.
Fraud Alerts: Providing tips and timely alerts to help users avoid financial scams.
Assist with Bill Payments:

CoinKeeper helps users manage their bills efficiently:
Schedule Payments: Assisting users in setting up automatic bill payments.
Bill Reminders: Sending reminders for upcoming bills and due dates.
Multiple Payment Options: Offering flexible payment methods, such as bank transfers or card payments.
Help Track Spending and Investments:

CoinKeeper offers detailed insights into spending and investments:
Transaction Tracking: Categorizing recent transactions by spending type (e.g., food, utilities).
Investment Tracking: Providing an overview of investments such as stocks, crypto, or bonds.
Savings Tracking: Keeping users updated on their progress toward financial goals.
Tailored Recommendations:

CoinKeeper delivers personalized financial recommendations based on user behavior:
Credit Card Offers: Suggesting the most relevant credit card offers.
Loan Options: Offering personalized loan suggestions based on the user’s credit standing.
Investment Suggestions: Providing suitable investment opportunities that match the user’s risk appetite and goals.
Provide Real-Time Assistance:

CoinKeeper delivers instant financial services such as:
Airtime/Data Purchase: Facilitating the quick purchase of airtime or data.
Account Balance Inquiry: Offering real-time account balance updates.
Transaction Notifications: Sending notifications once transactions are completed.
Assist with Loan and Credit Management:

CoinKeeper guides users through:
Loan Applications: Simplifying loan application processes and tracking status updates.
Loan Repayment Plans: Helping set up and manage repayment schedules.
Credit Score Monitoring: Providing insights and tips for improving or maintaining a healthy credit score.
Handle Off-Topic Conversations Gracefully:

CoinKeeper gently redirects non-financial conversations back to finance:
Example Response: "I’m here to help with your financial needs. Is there a specific transaction or financial advice you’d like assistance with?"
Keeping the conversation focused on financial matters is CoinKeeper’s priority.
Stay Informed on Financial Trends:

CoinKeeper provides insights into the latest financial trends and economic changes to help users make informed decisions:
News Alerts: Sharing updates on financial products, stock market movements, or changes in interest rates.
Step-by-Step Financial Guidance:

CoinKeeper simplifies complex financial processes by providing easy-to-follow instructions:
Example: "To apply for a loan, start by filling out the application form. I can guide you through the steps."
Offering status updates on ongoing tasks such as payments or applications.

`;
// Config Interface
interface IConfig {
	// Access control
	whitelistedPhoneNumbers: string[];
	whitelistedEnabled: boolean;
	// OpenAI
	openAIModel: string;
	openAIAPIKeys: string[];
	maxModelTokens: number;
	prePrompt: string | undefined;

	// Prefix
	prefixEnabled: boolean;
	prefixSkippedForMe: boolean;
	gptPrefix: string;
	dallePrefix: string;
	stableDiffusionPrefix: string;
	langChainPrefix: string;
	resetPrefix: string;
	aiConfigPrefix: string;

	// Groupchats
	groupchatsEnabled: boolean;

	// Prompt Moderation
	promptModerationEnabled: boolean;
	promptModerationBlacklistedCategories: string[];

	// AWS
	awsAccessKeyId: string;
	awsSecretAccessKey: string;
	awsRegion: string;
	awsPollyVoiceId: string;
	awsPollyEngine: AWSPollyEngine;

	// Voice transcription & Text-to-Speech
	speechServerUrl: string;
	whisperServerUrl: string;
	openAIServerUrl: string;
	whisperApiKey: string;
	ttsEnabled: boolean;
	ttsMode: TTSMode;
	ttsTranscriptionResponse: boolean;
	transcriptionEnabled: boolean;
	transcriptionMode: TranscriptionMode;
	transcriptionLanguage: string;
}

// Config
export const config: IConfig = {
	whitelistedPhoneNumbers: process.env.WHITELISTED_PHONE_NUMBERS?.split(",") || [],
	whitelistedEnabled: getEnvBooleanWithDefault("WHITELISTED_ENABLED", false),

	openAIAPIKeys: (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "").split(",").filter((key) => !!key), // Default: []
	openAIModel: process.env.OPENAI_GPT_MODEL || "gpt-3.5-turbo", // Default: gpt-3.5-turbo
	maxModelTokens: getEnvMaxModelTokens(), // Default: 4096
	prePrompt: prePrompt, // Default: undefined

	// Prefix
	prefixEnabled: getEnvBooleanWithDefault("PREFIX_ENABLED", true), // Default: true
	prefixSkippedForMe: getEnvBooleanWithDefault("PREFIX_SKIPPED_FOR_ME", true), // Default: true
	gptPrefix: "!ayo", // Default: !gpt
	dallePrefix: process.env.DALLE_PREFIX || "!dalle", // Default: !dalle
	stableDiffusionPrefix: process.env.STABLE_DIFFUSION_PREFIX || "!sd", // Default: !sd
	resetPrefix: process.env.RESET_PREFIX || "!reset", // Default: !reset
	aiConfigPrefix: process.env.AI_CONFIG_PREFIX || "!config", // Default: !config
	langChainPrefix: process.env.LANGCHAIN_PREFIX || "!lang", // Default: !lang

	// Groupchats
	groupchatsEnabled: getEnvBooleanWithDefault("GROUPCHATS_ENABLED", false), // Default: false

	// Prompt Moderation
	promptModerationEnabled: getEnvBooleanWithDefault("PROMPT_MODERATION_ENABLED", false), // Default: false
	promptModerationBlacklistedCategories: getEnvPromptModerationBlacklistedCategories(), // Default: ["hate", "hate/threatening", "self-harm", "sexual", "sexual/minors", "violence", "violence/graphic"]

	// AWS
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "", // Default: ""
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "", // Default: ""
	awsRegion: process.env.AWS_REGION || "", // Default: ""
	awsPollyVoiceId: process.env.AWS_POLLY_VOICE_ID || "", // Default: "Joanna"
	awsPollyEngine: getEnvAWSPollyVoiceEngine(), // Default: standard

	// Speech API, Default: https://speech-service.verlekar.com
	speechServerUrl: process.env.SPEECH_API_URL || "https://speech-service.verlekar.com",
	whisperServerUrl: process.env.WHISPER_API_URL || "https://transcribe.whisperapi.com",
	openAIServerUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/audio/transcriptions",
	whisperApiKey: process.env.WHISPER_API_KEY || "", // Default: ""

	// Text-to-Speech
	ttsEnabled: getEnvBooleanWithDefault("TTS_ENABLED", false), // Default: false
	ttsMode: getEnvTTSMode(), // Default: speech-api
	ttsTranscriptionResponse: getEnvBooleanWithDefault("TTS_TRANSCRIPTION_RESPONSE_ENABLED", true), // Default: true

	// Transcription
	transcriptionEnabled: getEnvBooleanWithDefault("TRANSCRIPTION_ENABLED", false), // Default: false
	transcriptionMode: getEnvTranscriptionMode(), // Default: local
	transcriptionLanguage: process.env.TRANSCRIPTION_LANGUAGE || "" // Default: null
};

/**
 * Get the max model tokens from the environment variable
 * @returns The max model tokens from the environment variable or 4096
 */
function getEnvMaxModelTokens() {
	const envValue = process.env.MAX_MODEL_TOKENS;
	if (envValue == undefined || envValue == "") {
		return 4096;
	}

	return parseInt(envValue);
}

/**
 * Get an environment variable as a boolean with a default value
 * @param key The environment variable key
 * @param defaultValue The default value
 * @returns The value of the environment variable or the default value
 */
function getEnvBooleanWithDefault(key: string, defaultValue: boolean): boolean {
	const envValue = process.env[key]?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return defaultValue;
	}

	return envValue == "true";
}

/**
 * Get the blacklist categories for prompt moderation from the environment variable
 * @returns Blacklisted categories for prompt moderation
 */
function getEnvPromptModerationBlacklistedCategories(): string[] {
	const envValue = process.env.PROMPT_MODERATION_BLACKLISTED_CATEGORIES;
	if (envValue == undefined || envValue == "") {
		return ["hate", "hate/threatening", "self-harm", "sexual", "sexual/minors", "violence", "violence/graphic"];
	} else {
		return JSON.parse(envValue.replace(/'/g, '"'));
	}
}

/**
 * Get the transcription mode from the environment variable
 * @returns The transcription mode
 */
function getEnvTranscriptionMode(): TranscriptionMode {
	const envValue = process.env.TRANSCRIPTION_MODE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return TranscriptionMode.Local;
	}

	return envValue as TranscriptionMode;
}

/**
 * Get the tss mode from the environment variable
 * @returns The tts mode
 */
function getEnvTTSMode(): TTSMode {
	const envValue = process.env.TTS_MODE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return TTSMode.SpeechAPI;
	}

	return envValue as TTSMode;
}

/**
 * Get the AWS Polly voice engine from the environment variable
 * @returns The voice engine
 */
function getEnvAWSPollyVoiceEngine(): AWSPollyEngine {
	const envValue = process.env.AWS_POLLY_VOICE_ENGINE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return AWSPollyEngine.Standard;
	}

	return envValue as AWSPollyEngine;
}

export default config;
