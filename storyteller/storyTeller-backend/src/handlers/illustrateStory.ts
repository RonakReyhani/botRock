import { MutationGetIllustrationArgs } from "../generated/graphql";
import { getStoryTellerInstance } from "../implementation/storyTellerAdaptor";


async function illustrator(event: { arguments: MutationGetIllustrationArgs }): Promise<{ presignedUrls: string[] }> {
    const { contents } = event.arguments

    const storyTellerInstance = getStoryTellerInstance();
    const result = await storyTellerInstance.getIllustration(contents);
    return { presignedUrls: result };
};

export const getIllustrationsHandler = illustrator