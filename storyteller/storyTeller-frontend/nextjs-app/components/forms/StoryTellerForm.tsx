import "react-circular-progressbar/dist/styles.css";
import { Button, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import LoadingDots from "../LoadingDots";
import { PostTextArea } from "../fields/PostTextArea";
import { useStoryTellerDispatch, useStoryTellerState } from "../../providers/StoryTellerProvider";
import { GENERATE_STORY, ILLUSTRATE_STORY } from "../../graphql/mutation";
import { useMutation } from "@apollo/react-hooks";
import { Mutation, MutationGenerateStoryArgs, MutationGetIllustrationArgs } from "../../generated/graphql";
import { splitTextIntoParagraphs, removePrefixFromParagraphs, cleanText } from "../../utils/storyFormatter";

export function GenerateStoryForm() {
  const [storyGenerated, setStoryGenerated] = useState(false);
  const { story } = useStoryTellerState();
  const [presignedUrls, setPresignedUrls] = useState([""]);
  const [paragraphs, setParagraphs] = useState([""])
  const dispatch = useStoryTellerDispatch();

  const [generateStory, { loading: storyLoading }] = useMutation<Mutation, MutationGenerateStoryArgs>(GENERATE_STORY, {
    errorPolicy: 'all',
    onCompleted: (data) => dispatch({
      type: "setStory",
      payload: { story: data.generateStory.story },
    })
  });

  useEffect(() => {
    if (story) {
      const paragraphs = cleanText(story)
      setParagraphs(paragraphs)
    }
  }, [story])

  const [generateImage, { loading: illustratorLoading }] = useMutation<Mutation, MutationGetIllustrationArgs>(
    ILLUSTRATE_STORY,
    {
      errorPolicy: 'all',
      onCompleted: data => {
        setPresignedUrls(data.getIllustration.presignedUrls);

      }
    }
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // clear the exiting story from state provider
    dispatch({
      type: "setStory",
      payload: { story: "" },
    })
    //  clear the generated graphics
    setPresignedUrls([""])
    e.preventDefault();
    const fields = e.currentTarget.elements;
    const topic = (fields.namedItem("topic") as HTMLTextAreaElement).value;
    await generateStory({ variables: { topic } })
  };

  const onIllustration = useCallback(async () => {
    await generateImage({ variables: { contents: paragraphs } })

  }, [paragraphs])

  return (
    <Stack direction="column" spacing="1em" width="100%">
      <form onSubmit={onSubmit}>
        <PostTextArea />
        <Button
          size="large"
          color="primary"
          variant="contained"
          type="submit"
          disabled={storyLoading || storyGenerated}
        >
          {storyLoading ? (
            <LoadingDots color="white" style="large" />
          ) : (
            story ? "Regenerate Story" : "Generate Story"
          )}
        </Button>
      </form>
      {story && paragraphs && (
        <Stack style={{ marginBottom: "2rem", marginTop: "2rem" }}>
          <Typography
            variant="h3"
            className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
          >
            Your AI Generated Story
          </Typography>

          {paragraphs.map((p, i) => (
            <Stack style={{ marginBottom: "2rem", marginTop: "2rem" }} key={i}>
              <Typography
                style={{ textAlign: "left" }}
                variant="body1"
                className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
              >
                {p}
              </Typography>
              {presignedUrls[i] && <img src={presignedUrls[i]} alt={`story-${i}`} />}
            </Stack>
          ))}
          <Button
            size="large"
            color="primary"
            variant="contained"
            onClick={onIllustration}
            disabled={storyLoading || illustratorLoading}
          >
            {illustratorLoading ? (
              <LoadingDots color="white" style="large" />
            ) : (
              "Illustrate Story"
            )}
          </Button>
        </Stack>
      )
      }
    </Stack >
  );
}


export default GenerateStoryForm