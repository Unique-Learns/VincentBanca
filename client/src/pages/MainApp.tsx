import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useMediaQuery } from "@/hooks/use-mobile";

const MainApp = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { activeConversation } = useChat();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Effect to handle mobile view logic
  useEffect(() => {
    if (isMobile) {
      if (activeConversation) {
        setShowSidebar(false);
        setShowChat(true);
      } else {
        setShowSidebar(true);
        setShowChat(false);
      }
    } else {
      setShowSidebar(true);
      setShowChat(true);
    }
  }, [isMobile, activeConversation]);

  const handleBackToList = () => {
    setShowSidebar(true);
    setShowChat(false);
  };

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar: Contacts & Conversations List */}
      {showSidebar && (
        <div className={`md:w-1/3 lg:w-1/4 flex flex-col border-r border-gray-200 bg-white ${isMobile ? 'absolute inset-0 z-10' : ''}`}>
          <Sidebar />
        </div>
      )}

      {/* Main Chat Area */}
      {showChat && (
        <div className={`flex-1 flex flex-col chat-bg ${isMobile ? 'absolute inset-0 z-20' : ''}`}>
          <ChatArea onBackClick={handleBackToList} />
        </div>
      )}
    </div>
  );
};

export default MainApp;
