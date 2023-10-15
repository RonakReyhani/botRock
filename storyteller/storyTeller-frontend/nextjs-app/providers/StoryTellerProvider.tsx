import React from "react";

// ========================================
// State
// ========================================
export interface StoryTeller {
  story: string;
}
export type State = StoryTeller;

// ========================================
// Actions
// ========================================
export type Action =
  | {
    type: "reset";
  }
  | {
    type: "setStory";
    payload: { story: string };
  };

// ========================================
// Reducer Functions
// ========================================
function StoryTellerReducer(state: State, action: Action): State {
  const actionType = action.type;
  switch (actionType) {
    case "reset": {
      return { story: "" };
    }

    case "setStory": {
      const { story } = action.payload || {};
      return {
        story: story
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${actionType}`);
    }
  }
}

// ========================================
// Provider
// ========================================
type Dispatch = (action: Action) => void;
type Props = { children: React.ReactNode };
const StoryTellerStateContext = React.createContext<State | undefined>(
  undefined
);
const StoryTellerDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);
const initialProps: State = { story: "" };
export function StoryTellerProvider({ children }: Props) {
  const [state, dispatch] = React.useReducer(
    StoryTellerReducer,
    initialProps
  );
  return (
    <StoryTellerStateContext.Provider value={state}>
      <StoryTellerDispatchContext.Provider value={dispatch}>
        {children}
      </StoryTellerDispatchContext.Provider>
    </StoryTellerStateContext.Provider>
  );
}

// ========================================
// Hook Functions
// ========================================
export function useStoryTellerState() {
  const context = React.useContext(StoryTellerStateContext);
  if (context === undefined) {
    throw new Error(
      "useStoryTellerState must be used within a StoryTellerProvider"
    );
  }
  return context;
}

export function useStoryTellerDispatch() {
  const context = React.useContext(StoryTellerDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useStoryTellerDispatch must be used within a StoryTellerProvider"
    );
  }
  return context;
}


export function reset(dispatch: Dispatch) {
  dispatch({ type: 'reset' });
}

export function SetError(dispatch: Dispatch, story: string) {
  dispatch({ type: 'setStory', payload: { story } });
}
