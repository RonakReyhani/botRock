import "react-circular-progressbar/dist/styles.css";
import { Stack, Typography } from "@mui/material";
import { GenerateStoryForm } from "../components/forms/StoryTellerForm";
import type { NextPage } from "next";

import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { StoryTellerProvider, useStoryTellerState } from "../providers/StoryTellerProvider";



const Home: NextPage = () => {


  return (
    <Stack
      component="main"
      direction="column"
      maxWidth="50em"
      mx="auto"
      alignItems="center"
      justifyContent="center"
      py="1em"
      spacing="1em"
    >

      <Typography
        variant="h3"
        className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
      >
        Chose your topic and the Story Teller generates the story!
      </Typography>

      <Stack
        spacing="1em"
        width="100%"
        maxWidth="48em"
        mx="auto"
        alignItems="center"
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <StoryTellerProvider>
          <GenerateStoryForm />
          <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        </StoryTellerProvider>
      </Stack>
    </Stack>
  );
};

export default Home;
