export interface IStoryTeller {
    generateStory(
        topic: string
    ): Promise<string>;
    getIllustration(
        contents: string[],
    ): Promise<string[]>;
}
