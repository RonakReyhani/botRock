import { MutationGenerateStoryArgs } from "../generated/graphql";
import { getStoryTellerInstance } from "../implementation/storyTellerAdaptor";


async function generateStory(event: { arguments: MutationGenerateStoryArgs }): Promise<string> {
    const { topic } = event.arguments
    const storyTellerInstance = getStoryTellerInstance();
    const result = await storyTellerInstance.generateStory(topic);
    return result;
};

export const generateStoryHandler = generateStory