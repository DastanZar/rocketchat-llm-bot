import {
    IHttp,
    IModify,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';

export class SummarizeCommand implements ISlashCommand {
    public command = 'summarize';
    public i18nParamsExample = 'summarize_text';
    public i18nDescription = 'Summarize the provided text using LLM';
    public providesPreview = false;

    private readonly appInfo: IAppInfo;

    // Configuration - replace with your actual API key and endpoint
    // These can also be set via environment variables
    private readonly apiKey: string = process.env.LLM_API_KEY || 'YOUR_API_KEY_HERE';
    private readonly apiEndpoint: string = process.env.LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    private readonly model: string = process.env.LLM_MODEL || 'gpt-3.5-turbo';

    constructor(appInfo: IAppInfo) {
        this.appInfo = appInfo;
    }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();
        const args = context.getArguments();

        // Get the text to summarize from arguments
        const textToSummarize = args.join(' ').trim();

        if (!textToSummarize) {
            await this.sendMessage(modify, room, sender, 'Please provide text to summarize. Usage: /summarize [text]');
            return;
        }

        try {
            // Send initial message indicating processing
            await this.sendMessage(modify, room, sender, 'Summarizing your text...');

            // Call the LLM API to summarize the text
            const summary = await this.callLLMApi(textToSummarize, http);

            // Send the summarized response
            await this.sendMessage(modify, room, sender, `**Summary:**\n${summary}`);
        } catch (error) {
            // Send error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            await this.sendMessage(modify, room, sender, `Error: ${errorMessage}`);
        }
    }

    /**
     * Makes a POST request to the LLM API to summarize the text
     */
    private async callLLMApi(text: string, http: IHttp): Promise<string> {
        const prompt = `Please summarize the following text concisely:\n\n${text}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
        };

        const body = JSON.stringify({
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const response = await http.post(this.apiEndpoint, {
            headers,
            content: body,
        });

        if (response.statusCode !== 200) {
            throw new Error(`LLM API returned status ${response.statusCode}: ${response.content}`);
        }

        const data = JSON.parse(response.content || '{}');
        
        // Handle different API response formats (OpenAI, Groq, etc.)
        const summary = data.choices?.[0]?.message?.content 
            || data.choices?.[0]?.text 
            || data.output?.[0]?.content 
            || 'No summary generated';

        return summary.trim();
    }

    /**
     * Sends a message to the room using the modify accessor
     */
    private async sendMessage(
        modify: IModify,
        room: IRoom,
        sender: IUser,
        text: string
    ): Promise<IMessage> {
        const messageBuilder = modify.getCreator().startMessage();
        
        messageBuilder
            .setRoom(room)
            .setSender(sender)
            .setText(text);

        return messageBuilder.getMessage();
    }
}
