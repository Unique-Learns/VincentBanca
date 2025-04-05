import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import MessageBubble from "./MessageBubble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatAreaProps {
  onBackClick: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ onBackClick }) => {
  const { activeConversation, currentMessages, sendMessage, isLoadingMessages } = useChat();
  const { currentUser } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeConversation) return;
    
    sendMessage(messageInput);
    setMessageInput("");
  };
  
  const groupMessagesByDate = () => {
    const groups: { [key: string]: typeof currentMessages } = {};
    
    currentMessages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateStr = date.toDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };
  
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="h-16 w-16 mx-auto text-muted-foreground mb-4"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2 className="text-xl font-semibold mb-2">Welcome to BancaMessenger</h2>
          <p className="text-muted-foreground">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <>
      {/* Chat Header */}
      <div className="px-4 py-3 bg-muted flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBackClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          </Button>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage 
              src={activeConversation.otherParticipant.avatar || ""} 
              alt={activeConversation.otherParticipant.username} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(activeConversation.otherParticipant.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{activeConversation.otherParticipant.username}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 relative">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                <div className="max-w-[75%]">
                  <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? "bg-emerald-50" : "bg-white"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([dateStr, messages]) => (
              <div key={dateStr}>
                {/* Date Marker */}
                <div className="flex justify-center mb-4">
                  <span className="bg-white px-3 py-1 text-xs text-muted-foreground rounded-lg">
                    {getDateLabel(dateStr)}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isCurrentUser={message.senderId === currentUser?.id} 
                  />
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Chat Input Area */}
      <div className="p-3 bg-muted border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </Button>
          <Input
            type="text"
            placeholder="Type a message"
            className="flex-1 mx-2 bg-background"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button type="submit" size="icon" className="bg-primary text-primary-foreground rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </form>
      </div>
    </>
  );
};

export default ChatArea;
