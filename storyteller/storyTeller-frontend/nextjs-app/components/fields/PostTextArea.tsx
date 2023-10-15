import { Box, TextField, Typography } from "@mui/material";

export type Vibe = "Professional" | "Casual" | "Funny";
export const vibes: Vibe[] = ["Professional", "Casual", "Funny"];

export function PostTextArea() {
  return (
    <Box>
      <Typography variant="body1">
        What topic do you want me to create a story about?
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={2}
        sx={{ "& textarea": { boxShadow: "none !important" } }}
        placeholder="e.g. a little girl playing in a playground"
        name="topic"
        style={{ marginBottom: "2rem", marginTop: "2rem" }}
      />
    </Box>
  );
}
