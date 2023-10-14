import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { IStoryTeller } from "../interface/storyTeller";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuid } from 'uuid';

let instance: IStoryTeller;

export function getStoryTellerInstance(): IStoryTeller {
    /* istanbul ignore next */
    if (!instance) {
        const bedrockRuntimeClient = new BedrockRuntimeClient({ region: "us-east-1" })
        const s3Client = new S3Client({ region: 'us-east-1' })
        const textModelId = "ai21.j2-ultra-v1";
        const imageModelId = "stability.stable-diffusion-xl-v0"
        const bucketName = `{process.env.BUCKET_NAME}`
        instance = new StoryTellerAdaptor(bedrockRuntimeClient, s3Client, textModelId, imageModelId, bucketName);
    }
    return instance;
}

class StoryTellerAdaptor implements IStoryTeller {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private bedrockRuntimeClient: BedrockRuntimeClient,
        private s3Client: S3Client,
        private textModelId: string,
        private imageModelId: string,
        private bucketName: string

    ) { }
    // ----------- Helpers -------------------------------------------------//


    private uploadImageToS3Bucket = async (fileData: string, bucketKey: string) => {
        try {
            if (this.bucketName && this.s3Client) {
                const buf = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const putObjectRequest: PutObjectCommandInput = {
                    Bucket: this.bucketName,
                    Key: bucketKey,
                    Body: buf,
                    ContentType: 'image/jpeg',
                };
                const putObjectCommand = new PutObjectCommand(putObjectRequest);
                const result = await this.s3Client.send(putObjectCommand);
                if (result) {
                    return true;
                }
                return false;
            }
        } catch (error) {
            throw new Error(`Failed to PUT item into S3: ${error}`);
        }
    }

    private getSignedUrl = async (key: string) => {
        try {
            const getSignedUrlParam = {
                Bucket: this.bucketName,
                Key: key,
            };

            const getObjectCommand = new GetObjectCommand(getSignedUrlParam);
            console.log('[getThumbnailSignedUrl] getSignedUrlParam', getSignedUrlParam);
            const url = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 3600 });
            return url;

        } catch (error) {
            throw new Error(`Failed to GET item from S3: ${error}`);
        }
    }

    private constructStoryPrompt = (topic: string): string => {
        return `"Write a story about ${topic} in 400 words. The story has to be in 3 separate paragraph. Each paragraph has to be  clearly labeled \\\"0.\\\", \\\"1.\\\" and \\\"2.\\\".\"`
    }

    private constructStoryRequestPayload = (prompt: string) => {
        return {
            "modelId": this.textModelId,
            "contentType": "application/json",
            "accept": "*/*",
            "body": `{\"prompt\":\ ${prompt},\"maxTokens\":200,\"temperature\":0.7,\"topP\":1,\"stopSequences\":[],\"countPenalty\":{\"scale\":0},\"presencePenalty\":{\"scale\":0},\"frequencyPenalty\":{\"scale\":0}}`
        }
    }
    private invokeTextModel = async (prompt: string): Promise<string> => {
        // construct model API payload
        const input = this.constructStoryRequestPayload(prompt)
        const command = new InvokeModelCommand(input);
        // InvokeModelRequest
        const response = await this.bedrockRuntimeClient.send(command);
        const story = response.body.transformToString()
        // get the text body
        const parsedStory = JSON.parse(story)
        console.log("----story", parsedStory.completions[0].data.text)
        return parsedStory.completions[0].data.text
    }
    private invokeImageModel = async (content: string): Promise<string> => {
        // construct model API payload
        const input = {
            "modelId": this.imageModelId,
            "contentType": "application/json",
            "accept": "*/*",
            "body": `{\"text_prompts\":[{\"text\":\`${content}\`}],\"cfg_scale\":13.1,\"seed\":0,\"steps\":70}`
        }

        const command = new InvokeModelCommand(input);
        // InvokeModelRequest
        const response = await this.bedrockRuntimeClient.send(command);

        const story = response.body.transformToString()
        // get the text body
        const parsedStory = JSON.parse(story)
        console.log("----story", parsedStory.completions[0].data.text)
        return parsedStory.completions[0].data.text
    }

    async generateStory(
        topic: string,
    ): Promise<string> {
        console.log(`user input is: ${topic}`);
        // construct prompt for user input
        const prompt = this.constructStoryPrompt(topic)
        return await this.invokeTextModel(prompt)
    }


    async getIllustration(
        contents: string[],
    ): Promise<string[]> {
        let presignedUrls: string[] = []
        const storyId = `story_${uuid()}`
        for (let i = 0; i < contents.length; i++) {
            // summarize the paragraph
            console.log(contents[i])
            const prompt = `Summarise this content with less than 50 words: ${contents[i]}`
            const summary = await this.invokeTextModel(prompt)
            // generate image for the summarised content
            const imageData = await this.invokeImageModel(summary)
            const bucketKey = `${storyId}/${i}`
            // upload image blob into S3 bucket
            await this.uploadImageToS3Bucket(imageData, bucketKey)
            // generate presigned url
            const url = await this.getSignedUrl(bucketKey)
            // return the url
            presignedUrls.push(url)
        }
        return presignedUrls
    }

}
