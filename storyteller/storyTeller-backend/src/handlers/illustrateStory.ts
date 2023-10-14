import { MutationGetIllustrationArgs } from "../generated/graphql";
import { getStoryTellerInstance } from "../implementation/storyTellerAdaptor";


async function illustrator(event: { arguments: MutationGetIllustrationArgs }): Promise<string[]> {
    const { contents } = event.arguments
    const storyTellerInstance = getStoryTellerInstance();
    const result = await storyTellerInstance.getIllustration(contents);
    return result;
};

export const getIllustrationsHandler = illustrator