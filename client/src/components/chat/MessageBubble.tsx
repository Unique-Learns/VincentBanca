import React from "react";
import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const renderMessageStatus = () => {
    switch (message.status) {
      case "sent":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case "delivered":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400">
            <polyline points="20 6 9 17 4 12"></polyline>
            <polyline points="20 12 9 23 4 18"></polyline>
          </svg>
        );
      case "read":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
            <polyline points="20 6 9 17 4 12"></polyline>
            <polyline points="20 12 9 23 4 18"></polyline>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={cn("flex mb-4", isCurrentUser ? "justify-end" : "")}>
      <div className={cn(
        "max-w-[75%] rounded-lg p-3 shadow-sm",
        isCurrentUser ? "sent-bubble" : "received-bubble"
      )}>
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          "flex items-center mt-1",
          isCurrentUser ? "justify-end" : ""
        )}>
          <span className="text-xs text-muted-foreground mr-1">
            {formatTime(message.timestamp)}
          </span>
          {isCurrentUser && renderMessageStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
