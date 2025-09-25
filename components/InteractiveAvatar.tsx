import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "02cb65bd014c44678b8c630064706cd9",
  knowledgeId: "6f44bb0ea8674324b88a586552935fb2",
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "fr",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const configRef = useRef<StartAvatarRequest>(DEFAULT_CONFIG);
  const hasStartedRef = useRef(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      console.debug("[UI] startSessionV2 invoked", { isVoiceChat });
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(configRef.current);

      if (isVoiceChat) {
        console.debug("[UI] Triggering voice chat start");
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current
          ?.play()
          .then(() => {
            console.debug("[UI] Media element playback started");
          })
          .catch((error) => {
            console.warn("[UI] Unable to autoplay media element", error);
          });
      };
    }
  }, [mediaStream, stream]);

  const requestStart = useMemoizedFn(() => {
    if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
      return;
    }

    console.debug("[UI] Launching avatar session from screen tap");
    hasStartedRef.current = true;
    startSessionV2(true);
  });

  const handleScreenClick = useMemoizedFn(() => {
    if (
      sessionState === StreamingAvatarSessionState.CONNECTED ||
      sessionState === StreamingAvatarSessionState.CONNECTING
    ) {
      console.debug("[UI] Stopping avatar session from screen tap");
      hasStartedRef.current = false;
      stopAvatar();
      return;
    }

    if (
      sessionState === StreamingAvatarSessionState.INACTIVE &&
      !hasStartedRef.current
    ) {
      requestStart();
    }
  });

  return (
    <div
      className="flex min-h-screen w-screen items-center justify-center bg-black"
      onClick={handleScreenClick}
    >
      <div className="relative h-screen w-screen">
        <AvatarVideo ref={mediaStream} />
        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
            Cliquez pour lancer l'avatar vocal (cliquez de nouveau pour arrêter)
          </div>
        )}
        {sessionState === StreamingAvatarSessionState.CONNECTING && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
            Connexion en cours...
          </div>
        )}
        <div className="absolute bottom-1 right-1 h-[150px] w-[150px] rounded-lg bg-black" />
      </div>
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
