import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { User, Contact, Conversation, Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ConversationWithDetails extends Conversation {
  otherParticipant: User;
  latestMessage: Message | null;
  unreadCount: number;
}

interface ChatContextType {
  contacts: (Contact & { contactUser: User })[];
  conversations: ConversationWithDetails[];
  activeConversation: ConversationWithDetails | null;
  currentMessages: Message[];
  isLoadingContacts: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  fetchContacts: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  syncContacts: (phoneNumbers: string[]) => Promise<void>;
  setActiveConversation: (conversation: ConversationWithDetails | null) => void;
  startConversation: (contactId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageIds: number[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { socket, isConnected, sendMessage: sendWsMessage } = useWebSocket();
  
  const [contacts, setContacts] = useState<(Contact & { contactUser: User })[]>([]);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          const message = data.message as Message;
          
          // Add message to current conversation if active
          if (activeConversation && activeConversation.id === message.conversationId) {
            setCurrentMessages(prev => [...prev, message]);
            
            // Mark the message as read
            markAsRead([message.id]);
          }
          
          // Update conversations list with new message
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.id === message.conversationId) {
                return {
                  ...conv,
                  latestMessage: message,
                  unreadCount: activeConversation?.id === conv.id 
                    ? conv.unreadCount 
                    : conv.unreadCount + 1,
                  lastMessageTime: message.timestamp
                };
              }
              return conv;
            });
          });
        }
        
        else if (data.type === 'message_update') {
          const { messageId, status } = data;
          
          // Update message status in current messages
          setCurrentMessages(prev => {
            return prev.map(msg => {
              if (msg.id === messageId) {
                return { ...msg, status };
              }
              return msg;
            });
          });
          
          // Update in conversations if it's the latest message
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.latestMessage && conv.latestMessage.id === messageId) {
                return {
                  ...conv,
                  latestMessage: { ...conv.latestMessage, status }
                };
              }
              return conv;
            });
          });
        }
        
        else if (data.type === 'message_sent') {
          const message = data.message as Message;
          
          // Add the sent message to current messages
          setCurrentMessages(prev => [...prev, message]);
          
          // Update conversations list
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.id === message.conversationId) {
                return {
                  ...conv,
                  latestMessage: message,
                  lastMessageTime: message.timestamp
                };
              }
              return conv;
            });
          });
        }
        
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    socket.addEventListener('message', messageHandler);

    return () => {
      socket.removeEventListener('message', messageHandler);
    };
  }, [socket, activeConversation]);

  // Authenticate with WebSocket when connected
  useEffect(() => {
    if (isConnected && currentUser) {
      sendWsMessage({
        type: 'authenticate',
        userId: currentUser.id
      });
    }
  }, [isConnected, currentUser, sendWsMessage]);

  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoadingContacts(true);
    try {
      const response = await fetch(`/api/contacts/${currentUser.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load contacts'
      });
    } finally {
      setIsLoadingContacts(false);
    }
  }, [currentUser, toast]);

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`/api/conversations/${currentUser.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load conversations'
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUser, toast]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setCurrentMessages(data);
      
      // Mark all received messages as read
      const messagesToMark = data
        .filter((msg: Message) => msg.senderId !== currentUser?.id && msg.status !== 'read')
        .map((msg: Message) => msg.id);
      
      if (messagesToMark.length > 0) {
        markAsRead(messagesToMark);
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load messages'
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUser, toast]);

  const syncContacts = useCallback(async (phoneNumbers: string[]) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/contacts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          phoneNumbers
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync contacts');
      }
      
      const data = await response.json();
      
      if (data.addedContacts.length > 0) {
        setContacts(prev => [...prev, ...data.addedContacts]);
        toast({
          title: 'Contacts Synced',
          description: `Found ${data.addedContacts.length} new contacts`
        });
      } else {
        toast({
          title: 'No New Contacts',
          description: 'No new contacts were found'
        });
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sync contacts'
      });
    }
  }, [currentUser, toast]);

  const startConversation = useCallback(async (contactId: number) => {
    if (!currentUser) return;
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        conv => 
          (conv.participantA === currentUser.id && conv.participantB === contactId) ||
          (conv.participantA === contactId && conv.participantB === currentUser.id)
      );
      
      if (existingConversation) {
        setActiveConversation(existingConversation);
        await fetchMessages(existingConversation.id);
        return;
      }
      
      // Create new conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantA: currentUser.id,
          participantB: contactId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
      
      const data = await response.json();
      
      // Get contact details for this conversation
      const contact = contacts.find(c => c.contactId === contactId);
      if (!contact) return;
      
      const newConversation: ConversationWithDetails = {
        ...data.conversation,
        otherParticipant: contact.contactUser,
        latestMessage: null,
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setCurrentMessages([]);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start conversation'
      });
    }
  }, [currentUser, contacts, conversations, fetchMessages, toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentUser || !activeConversation || !isConnected) return;
    
    try {
      sendWsMessage({
        type: 'message',
        conversationId: activeConversation.id,
        content
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message'
      });
    }
  }, [currentUser, activeConversation, isConnected, sendWsMessage, toast]);

  const markAsRead = useCallback((messageIds: number[]) => {
    if (!isConnected || messageIds.length === 0) return;
    
    try {
      sendWsMessage({
        type: 'read_receipt',
        messageIds
      });
      
      // Optimistically update UI
      setCurrentMessages(prev => {
        return prev.map(msg => {
          if (messageIds.includes(msg.id)) {
            return { ...msg, status: 'read' };
          }
          return msg;
        });
      });
      
      // Update unread count in active conversation
      if (activeConversation) {
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === activeConversation.id) {
              return {
                ...conv,
                unreadCount: 0,
                latestMessage: conv.latestMessage && messageIds.includes(conv.latestMessage.id)
                  ? { ...conv.latestMessage, status: 'read' }
                  : conv.latestMessage
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [isConnected, sendWsMessage, activeConversation]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
      fetchConversations();
    }
  }, [isAuthenticated, fetchContacts, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        contacts,
        conversations,
        activeConversation,
        currentMessages,
        isLoadingContacts,
        isLoadingConversations,
        isLoadingMessages,
        fetchContacts,
        fetchConversations,
        fetchMessages,
        syncContacts,
        setActiveConversation,
        startConversation,
        sendMessage,
        markAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
