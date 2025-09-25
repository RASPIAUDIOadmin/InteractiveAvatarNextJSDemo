import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useVoiceChat = () => {
  const {
    avatarRef,
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();

  const startVoiceChat = useCallback(
    async (isInputAudioMuted?: boolean) => {
      if (!avatarRef.current) {
        console.warn("[VoiceChat] startVoiceChat called but avatarRef is empty");
        return;
      }

      console.debug("[VoiceChat] Starting voice chat", {
        isInputAudioMuted,
      });

      setIsVoiceChatLoading(true);

      try {
        await avatarRef.current.startVoiceChat({
          isInputAudioMuted,
        });
        console.debug("[VoiceChat] Voice chat started successfully");
        setIsVoiceChatActive(true);
        setIsMuted(!!isInputAudioMuted);
      } catch (error) {
        console.error("[VoiceChat] Failed to start voice chat", error);
        throw error;
      } finally {
        setIsVoiceChatLoading(false);
      }
    },
    [avatarRef, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading],
  );

  const stopVoiceChat = useCallback(() => {
    if (!avatarRef.current) {
      console.warn("[VoiceChat] stopVoiceChat called but avatarRef is empty");
      return;
    }

    console.debug("[VoiceChat] Stopping voice chat");
    avatarRef.current.closeVoiceChat();
    setIsVoiceChatActive(false);
    setIsMuted(true);
  }, [avatarRef, setIsMuted, setIsVoiceChatActive]);

  const muteInputAudio = useCallback(() => {
    if (!avatarRef.current) {
      console.warn("[VoiceChat] muteInputAudio called but avatarRef is empty");
      return;
    }

    console.debug("[VoiceChat] Muting input audio");
    avatarRef.current.muteInputAudio();
    setIsMuted(true);
  }, [avatarRef, setIsMuted]);

  const unmuteInputAudio = useCallback(() => {
    if (!avatarRef.current) {
      console.warn("[VoiceChat] unmuteInputAudio called but avatarRef is empty");
      return;
    }

    console.debug("[VoiceChat] Unmuting input audio");
    avatarRef.current.unmuteInputAudio();
    setIsMuted(false);
  }, [avatarRef, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
  };
};
