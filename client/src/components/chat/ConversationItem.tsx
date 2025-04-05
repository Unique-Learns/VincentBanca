import React from "react";
import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Import the extended Conversation type from ChatContext
type ConversationWithDetails = ReturnType<typeof useChat>["conversations"][number];

interface ConversationItemProps {
  conversation: ConversationWithDetails;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  const { activeConversation, setActiveConversation, fetchMessages } = useChat();
  
  const isActive = activeConversation?.id === conversation.id;
  
  const handleClick = async () => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
  };
  
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // This week
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const getMessagePreview = () => {
    if (!conversation.latestMessage) return "No messages yet";
    return conversation.latestMessage.content;
  };
  
  const renderMessageStatus = () => {
    const message = conversation.latestMessage;
    if (!message || message.senderId !== conversation.otherParticipant.id) {
      switch (message?.status) {
        case "sent":
          return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400 mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          );
        case "delivered":
          return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400 mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
              <polyline points="20 12 9 23 4 18"></polyline>
            </svg>
          );
        case "read":
          return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500 mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
              <polyline points="20 12 9 23 4 18"></polyline>
            </svg>
          );
        default:
          return null;
      }
    }
    return null;
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div 
      className={cn(
        "p-3 flex items-center hover:bg-muted cursor-pointer border-b border-border",
        isActive ? "bg-muted" : ""
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3 relative">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={conversation.otherParticipant.avatar || ""} 
            alt={conversation.otherParticipant.username} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(conversation.otherParticipant.username)}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator - just a demo for now */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="font-medium truncate">{conversation.otherParticipant.username}</h4>
          <span className="text-xs text-muted-foreground">
            {conversation.latestMessage && formatTime(conversation.latestMessage.timestamp)}
          </span>
        </div>
        <div className="flex items-center">
          {renderMessageStatus()}
          <p className="text-sm text-muted-foreground truncate pr-2">{getMessagePreview()}</p>
          {conversation.unreadCount > 0 && (
            <div className="ml-auto flex-shrink-0">
              <span className="bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
