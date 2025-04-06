import React, { createContext, useContext, useState } from "react";

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [chatbotVisible, setChatbotVisible] = useState(true);
  const [catbotIcon, setCatbotIcon] = useState("blue"); // Default icon

  return (
    <ChatbotContext.Provider value={{ chatbotVisible, setChatbotVisible, catbotIcon, setCatbotIcon }}>
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
