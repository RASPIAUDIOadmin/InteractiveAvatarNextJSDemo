import StreamingAvatar, {
  ConnectionQuality,
  StartAvatarRequest,
  StreamingEvents,
} from "@heygen/streaming-avatar";
import { useCallback } from "react";

import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./context";
import { useVoiceChat } from "./useVoiceChat";
import { useMessageHistory } from "./useMessageHistory";

export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    basePath,
    sessionState,
    setSessionState,
    stream,
    setStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
  } = useStreamingAvatarContext();
  const { stopVoiceChat } = useVoiceChat();

  useMessageHistory();

  const init = useCallback(
    (token: string) => {
      console.debug("[Session] Initializing StreamingAvatar instance", {
        hasToken: !!token,
        basePath,
      });
      avatarRef.current = new StreamingAvatar({
        token,
        basePath: basePath,
      });

      return avatarRef.current;
    },
    [basePath, avatarRef],
  );

  const handleStream = useCallback(
    ({ detail }: { detail: MediaStream }) => {
      console.debug("[Session] Received media stream", {
        id: detail?.id,
        audioTracks: detail?.getAudioTracks().length,
        videoTracks: detail?.getVideoTracks().length,
      });
      setStream(detail);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setSessionState, setStream],
  );

  const stop = useCallback(async () => {
    console.debug("[Session] Stopping avatar session");
    avatarRef.current?.off(StreamingEvents.STREAM_READY, handleStream);
    avatarRef.current?.off(StreamingEvents.STREAM_DISCONNECTED, stop);
    clearMessages();
    stopVoiceChat();
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    await avatarRef.current?.stopAvatar();
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    handleStream,
    setSessionState,
    setStream,
    avatarRef,
    setIsListening,
    stopVoiceChat,
    clearMessages,
    setIsUserTalking,
    setIsAvatarTalking,
  ]);

  const start = useCallback(
    async (config: StartAvatarRequest, token?: string) => {
      if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
        throw new Error("There is already an active session");
      }

      if (!avatarRef.current) {
        if (!token) {
          throw new Error("Token is required");
        }
        init(token);
      }

      if (!avatarRef.current) {
        throw new Error("Avatar is not initialized");
      }

      setSessionState(StreamingAvatarSessionState.CONNECTING);
      console.debug("[Session] Starting avatar", {
        language: config.language,
        avatarName: config.avatarName,
        knowledgeId: config.knowledgeId,
      });
      avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, stop);
      avatarRef.current.on(
        StreamingEvents.CONNECTION_QUALITY_CHANGED,
        ({ detail }: { detail: ConnectionQuality }) => {
          console.debug("[Session] Connection quality changed", detail);
          setConnectionQuality(detail);
        },
      );
      avatarRef.current.on(StreamingEvents.USER_START, () => {
        console.debug("[Session] Detected user start talking event");
        setIsUserTalking(true);
      });
      avatarRef.current.on(StreamingEvents.USER_STOP, () => {
        console.debug("[Session] Detected user stop talking event");
        setIsUserTalking(false);
      });
      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.debug("[Session] Avatar started talking");
        setIsAvatarTalking(true);
      });
      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.debug("[Session] Avatar stopped talking");
        setIsAvatarTalking(false);
      });
      avatarRef.current.on(
        StreamingEvents.USER_TALKING_MESSAGE,
        (event: CustomEvent<any>) => {
          console.debug(
            "[Session] User talking message",
            event?.detail?.message,
          );
          handleUserTalkingMessage(event as unknown as { detail: any });
        },
      );
      avatarRef.current.on(
        StreamingEvents.AVATAR_TALKING_MESSAGE,
        (event: CustomEvent<any>) => {
          console.debug(
            "[Session] Avatar talking message",
            event?.detail?.message,
          );
          handleStreamingTalkingMessage(event as unknown as { detail: any });
        },
      );
      avatarRef.current.on(StreamingEvents.USER_END_MESSAGE, () => {
        console.debug("[Session] User end message");
        handleEndMessage();
      });
      avatarRef.current.on(StreamingEvents.AVATAR_END_MESSAGE, () => {
        console.debug("[Session] Avatar end message");
        handleEndMessage();
      });

      try {
        await avatarRef.current.createStartAvatar(config);
        console.debug("[Session] Avatar session created");
      } catch (error) {
        console.error("[Session] Failed to create avatar session", error);
        throw error;
      }

      return avatarRef.current;
    },
    [
      init,
      handleStream,
      stop,
      setSessionState,
      avatarRef,
      sessionState,
      setConnectionQuality,
      setIsUserTalking,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
      setIsAvatarTalking,
    ],
  );

  return {
    avatarRef,
    sessionState,
    stream,
    initAvatar: init,
    startAvatar: start,
    stopAvatar: stop,
  };
};
