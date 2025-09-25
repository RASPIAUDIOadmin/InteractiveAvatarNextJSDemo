import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-3xl flex-col gap-2 self-center overflow-y-auto px-4 py-2 text-white max-h-[240px]"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col gap-1 max-w-[350px] ${
            message.sender === MessageSender.CLIENT
              ? "self-end items-end"
              : "self-start items-start"
          }`}
        >
          <p className="text-xs text-zinc-400">
            {message.sender === MessageSender.AVATAR ? "Avatar" : "Vous"}
          </p>
          <p className="text-sm">{message.content}</p>
        </div>
      ))}
    </div>
  );
};
