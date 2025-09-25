import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useTextChat } from "../logic/useTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.TALK]: "Converser",
  [TaskType.REPEAT]: "Repeter",
};

const TASK_MODE_LABELS: Record<TaskMode, string> = {
  [TaskMode.SYNC]: "Synchrone",
  [TaskMode.ASYNC]: "Asynchrone",
};

export const TextInput: React.FC = () => {
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useTextChat();
  const { startListening, stopListening } = useConversationState();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    if (taskType === TaskType.TALK) {
      taskMode === TaskMode.SYNC
        ? sendMessageSync(message)
        : sendMessage(message);
    } else {
      taskMode === TaskMode.SYNC
        ? repeatMessageSync(message)
        : repeatMessage(message);
    }
    setMessage("");
  }, [
    taskType,
    taskMode,
    message,
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-row gap-2 items-end w-full">
      <Select
        isSelected={(option) => option === taskType}
        options={Object.values(TaskType)}
        renderOption={(option) => TASK_TYPE_LABELS[option]}
        value={TASK_TYPE_LABELS[taskType]}
        onSelect={setTaskType}
      />
      <Select
        isSelected={(option) => option === taskMode}
        options={Object.values(TaskMode)}
        renderOption={(option) => TASK_MODE_LABELS[option]}
        value={TASK_MODE_LABELS[taskMode]}
        onSelect={setTaskMode}
      />
      <Input
        className="min-w-[500px]"
        placeholder={`Ecrire un message pour que l'avatar ${
          taskType === TaskType.REPEAT ? "repete" : "reponde"
        }...`}
        value={message}
        onChange={setMessage}
      />
      <Button className="!p-2" onClick={handleSend}>
        <SendIcon size={20} />
      </Button>
    </div>
  );
};
