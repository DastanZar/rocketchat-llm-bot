import {
    IAppAccessors,
    IHttp,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SummarizeCommand } from './SummarizeCommand';

export class LlmSummarizerBotApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async onEnable(): Promise<boolean> {
        this.getLogger().info('LLM Summarizer Bot has been enabled with /summarize command');
        return true;
    }

    public async onDisable(): Promise<void> {
        this.getLogger().info('LLM Summarizer Bot has been disabled');
    }

    /**
     * Get the slash commands provided by this app
     * Rocket.Chat will use this to register the slash commands defined in app.json
     */
    public async getSlashCommands(): Promise<SummarizeCommand[]> {
        // Return array of slash commands
        // The command is registered via app.json configuration
        const summarizeCommand = new SummarizeCommand(this.getInfo());
        return [summarizeCommand];
    }
}
