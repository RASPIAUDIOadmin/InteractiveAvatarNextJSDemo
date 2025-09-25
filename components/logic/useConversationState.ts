import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useConversationState = () => {
  const { avatarRef, isAvatarTalking, isUserTalking, isListening } =
    useStreamingAvatarContext();

  const startListening = useCallback(() => {
    if (!avatarRef.current) {
      console.warn("[Conversation] startListening called but avatarRef is empty");
      return;
    }

    console.debug("[Conversation] Requesting avatar to start listening");
    avatarRef.current.startListening();
  }, [avatarRef]);

  const stopListening = useCallback(() => {
    if (!avatarRef.current) {
      console.warn("[Conversation] stopListening called but avatarRef is empty");
      return;
    }

    console.debug("[Conversation] Requesting avatar to stop listening");
    avatarRef.current.stopListening();
  }, [avatarRef]);

  return {
    isAvatarListening: isListening,
    startListening,
    stopListening,
    isUserTalking,
    isAvatarTalking,
  };
};
