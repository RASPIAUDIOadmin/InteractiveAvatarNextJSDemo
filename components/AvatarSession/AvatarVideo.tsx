import React, { forwardRef } from "react";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState } = useStreamingAvatarSession();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <>
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <track kind="captions" />
      </video>
      {!isLoaded && (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
          Chargement...
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
