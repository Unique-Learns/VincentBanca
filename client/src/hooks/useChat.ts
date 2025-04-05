import { useContext } from "react";
import { useChat as useChatContext } from "../contexts/ChatContext";

// Re-export the hook for easier imports
export const useChat = useChatContext;
