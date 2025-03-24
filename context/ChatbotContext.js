// context/ChatbotContext.js
import React, { createContext, useContext, useState } from "react";

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [chatbotVisible, setChatbotVisible] = useState(true);

  return (
    <ChatbotContext.Provider value={{ chatbotVisible, setChatbotVisible }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};
