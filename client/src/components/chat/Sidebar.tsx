import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import ConversationItem from "./ConversationItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const { conversations, contacts, startConversation, syncContacts, isLoadingConversations } = useChat();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);

  const filteredConversations = conversations.filter((conv) => 
    conv.otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter((contact) =>
    contact.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactClick = async (contactId: number) => {
    await startConversation(contactId);
    setIsContactsDialogOpen(false);
  };

  const handleSyncContacts = () => {
    // Mock sync with some hardcoded phone numbers for demo
    const mockPhoneNumbers = [
      "+14155552671", 
      "+14155552672", 
      "+14155552673", 
      "+14155552674"
    ];
    
    syncContacts(mockPhoneNumbers);
    toast({
      title: "Syncing contacts",
      description: "Looking for contacts using BancaMessenger..."
    });
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
    <>
      {/* Sidebar Header */}
      <div className="px-4 py-3 bg-muted flex items-center justify-between">
        <h1 className="text-xl font-bold">BancaMessenger</h1>
        <div className="flex space-x-4">
          <Dialog open={isContactsDialogOpen} onOpenChange={setIsContactsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contacts</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <Button onClick={handleSyncContacts} variant="outline" className="w-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                  </svg>
                  Sync Contacts
                </Button>
                
                <Input
                  placeholder="Search contacts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                
                <ScrollArea className="h-[50vh]">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No contacts found</p>
                      <Button variant="link" onClick={handleSyncContacts} className="mt-2">
                        Sync your contacts
                      </Button>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center p-3 hover:bg-muted cursor-pointer rounded-md"
                        onClick={() => handleContactClick(contact.contactId)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={contact.contactUser.avatar || ""} alt={contact.contactName} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(contact.contactName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.contactName}</p>
                          <p className="text-xs text-muted-foreground">{contact.contactUser.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSyncContacts}>
                Sync Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsContactsDialogOpen(true)}>
                New Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-white">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search or start a new chat"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      {isLoadingConversations ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg 
              className="animate-spin h-8 w-8 text-primary mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-12 w-12 mx-auto text-muted-foreground mb-3"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3 className="text-lg font-medium">No conversations yet</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm ? "No results found" : "Start chatting with your contacts"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsContactsDialogOpen(true)} 
                  className="mt-4"
                >
                  Start a new chat
                </Button>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem 
                key={conversation.id} 
                conversation={conversation} 
              />
            ))
          )}
        </ScrollArea>
      )}
    </>
  );
};

export default Sidebar;
