import React, { useMemo, useState } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

const QUALITY_LABELS: Record<AvatarQuality, string> = {
  [AvatarQuality.Low]: "Basse",
  [AvatarQuality.Medium]: "Moyenne",
  [AvatarQuality.High]: "Haute",
};

const TRANSPORT_LABELS: Record<VoiceChatTransport, string> = {
  [VoiceChatTransport.WEBSOCKET]: "WebSocket",
  [VoiceChatTransport.LIVEKIT]: "LiveKit",
};

const EMOTION_LABELS: Record<VoiceEmotion, string> = {
  [VoiceEmotion.EXCITED]: "Enthousiaste",
  [VoiceEmotion.SERIOUS]: "Serieuse",
  [VoiceEmotion.FRIENDLY]: "Amicale",
  [VoiceEmotion.SOOTHING]: "Apaisante",
  [VoiceEmotion.BROADCASTER]: "Diffuseur",
};

const ELEVEN_MODEL_LABELS: Record<ElevenLabsModel, string> = {
  [ElevenLabsModel.eleven_flash_v2_5]: "Eleven Flash v2.5",
  [ElevenLabsModel.eleven_multilingual_v2]: "Eleven Multilingual v2",
};

const STT_PROVIDER_LABELS: Record<STTProvider, string> = {
  [STTProvider.DEEPGRAM]: "Deepgram",
  [STTProvider.GLADIA]: "Gladia",
};

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
}) => {
  const onChange = <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => {
    onConfigChange({ ...config, [key]: value });
  };
  const [showMore, setShowMore] = useState<boolean>(false);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

    if (!avatar) {
      return {
        isCustom: true,
        name: "ID d'avatar personnalise",
        avatarId: null,
      };
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      };
    }
  }, [config.avatarName]);

  const selectedQualityLabel = config.quality
    ? QUALITY_LABELS[config.quality]
    : undefined;
  const selectedTransportLabel = config.voiceChatTransport
    ? TRANSPORT_LABELS[config.voiceChatTransport]
    : undefined;
  const selectedEmotionLabel = config.voice?.emotion
    ? EMOTION_LABELS[config.voice.emotion]
    : undefined;
  const selectedModelLabel = config.voice?.model
    ? ELEVEN_MODEL_LABELS[config.voice.model]
    : undefined;
  const selectedProviderLabel = config.sttSettings?.provider
    ? STT_PROVIDER_LABELS[config.sttSettings.provider]
    : undefined;

  return (
    <div className="relative flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <Field label="ID de base de connaissances">
        <Input
          placeholder="Saisir l'ID de base de connaissances"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
        />
      </Field>
      <Field label="ID de l'avatar">
        <Select
          isSelected={(option) =>
            typeof option === "string"
              ? !!selectedAvatar?.isCustom
              : option.avatar_id === selectedAvatar?.avatarId
          }
          options={[...AVATARS, "CUSTOM"]}
          placeholder="Choisir un avatar"
          renderOption={(option) => {
            return typeof option === "string"
              ? "ID d'avatar personnalise"
              : option.name;
          }}
          value={
            selectedAvatar?.isCustom
              ? "ID d'avatar personnalise"
              : selectedAvatar?.name
          }
          onSelect={(option) => {
            if (typeof option === "string") {
              onChange("avatarName", "");
            } else {
              onChange("avatarName", option.avatar_id);
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="ID d'avatar personnalise">
          <Input
            placeholder="Saisir l'ID de l'avatar"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        </Field>
      )}
      <Field label="Langue">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={
            STT_LANGUAGE_LIST.find((option) => option.value === config.language)
              ?.label
          }
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      <Field label="Qualite de l'avatar">
        <Select
          isSelected={(option) => option === config.quality}
          options={Object.values(AvatarQuality)}
          renderOption={(option) => QUALITY_LABELS[option]}
          value={selectedQualityLabel}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>
      <Field label="Transport du chat vocal">
        <Select
          isSelected={(option) => option === config.voiceChatTransport}
          options={Object.values(VoiceChatTransport)}
          renderOption={(option) => TRANSPORT_LABELS[option]}
          value={selectedTransportLabel}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>
      {showMore && (
        <>
          <h1 className="mt-5 w-full text-center text-zinc-100">
            Parametres vocaux
          </h1>
          <Field label="ID de voix personnalise">
            <Input
              placeholder="Saisir l'ID de la voix"
              value={config.voice?.voiceId}
              onChange={(value) =>
                onChange("voice", { ...config.voice, voiceId: value })
              }
            />
          </Field>
          <Field label="Emotion">
            <Select
              isSelected={(option) => option === config.voice?.emotion}
              options={Object.values(VoiceEmotion)}
              renderOption={(option) => EMOTION_LABELS[option]}
              value={selectedEmotionLabel}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, emotion: option })
              }
            />
          </Field>
          <Field label="Modele ElevenLabs">
            <Select
              isSelected={(option) => option === config.voice?.model}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => ELEVEN_MODEL_LABELS[option]}
              value={selectedModelLabel}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, model: option })
              }
            />
          </Field>
          <h1 className="mt-5 w-full text-center text-zinc-100">
            Parametres STT
          </h1>
          <Field label="Fournisseur">
            <Select
              isSelected={(option) => option === config.sttSettings?.provider}
              options={Object.values(STTProvider)}
              renderOption={(option) => STT_PROVIDER_LABELS[option]}
              value={selectedProviderLabel}
              onSelect={(option) =>
                onChange("sttSettings", {
                  ...config.sttSettings,
                  provider: option,
                })
              }
            />
          </Field>
        </>
      )}
      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Afficher moins" : "Afficher plus..."}
      </button>
    </div>
  );
};
