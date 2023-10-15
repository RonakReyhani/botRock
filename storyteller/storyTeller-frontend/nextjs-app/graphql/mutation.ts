import gql from 'graphql-tag';


export const GENERATE_STORY = gql`
  mutation GenerateStory($topic: String!) {
    generateStory(topic: $topic) {
        story

    }
  }
`;


export const ILLUSTRATE_STORY = gql`
  mutation GetIllustration($contents: [String!]!) {
    getIllustration(contents: $contents) {
        presignedUrls
    }
  }
`;