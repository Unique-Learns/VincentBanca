import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertContactSchema, 
  insertMessageSchema, 
  insertConversationSchema
} from "@shared/schema";

// Type for connected clients
interface ConnectedClient {
  userId: number;
  socket: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Keep track of connected clients
  const clients: ConnectedClient[] = [];
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'authenticate') {
          const user = await storage.getUserById(data.userId);
          if (user) {
            userId = user.id;
            
            // Remove any existing connections for this user
            const existingClientIndex = clients.findIndex(client => client.userId === userId);
            if (existingClientIndex !== -1) {
              clients.splice(existingClientIndex, 1);
            }
            
            // Add new client connection
            clients.push({ userId, socket: ws });
            
            // Send back acknowledgment
            ws.send(JSON.stringify({ 
              type: 'authenticated', 
              success: true 
            }));
          } else {
            ws.send(JSON.stringify({ 
              type: 'authenticated', 
              success: false, 
              error: 'User not found' 
            }));
          }
        }
        
        // Handle chat messages
        else if (data.type === 'message' && userId) {
          const { conversationId, content } = data;
          
          // Store message in database
          const newMessage = await storage.createMessage({
            conversationId,
            senderId: userId,
            content,
            status: 'sent'
          });
          
          // Get conversation details
          const conversation = await storage.getConversationById(conversationId);
          
          if (conversation) {
            // Determine recipient
            const recipientId = conversation.participantA === userId 
              ? conversation.participantB 
              : conversation.participantA;
            
            // Send message to recipient if they're connected
            const recipientClient = clients.find(client => client.userId === recipientId);
            if (recipientClient && recipientClient.socket.readyState === WebSocket.OPEN) {
              recipientClient.socket.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
              
              // Update message status to delivered
              const updatedMessage = await storage.updateMessageStatus(newMessage.id, 'delivered');
              
              // Notify sender of delivery status
              ws.send(JSON.stringify({
                type: 'message_update',
                messageId: newMessage.id,
                status: 'delivered'
              }));
            }
            
            // Send confirmation to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: newMessage
            }));
          }
        }
        
        // Handle read receipts
        else if (data.type === 'read_receipt' && userId) {
          const { messageIds } = data;
          
          for (const messageId of messageIds) {
            // Update message status to read
            const message = await storage.updateMessageStatus(messageId, 'read');
            
            if (message) {
              // Find the sender and notify them if they're connected
              const senderClient = clients.find(client => client.userId === message.senderId);
              if (senderClient && senderClient.socket.readyState === WebSocket.OPEN) {
                senderClient.socket.send(JSON.stringify({
                  type: 'message_update',
                  messageId: message.id,
                  status: 'read'
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from connected clients
      if (userId) {
        const index = clients.findIndex(client => client.userId === userId);
        if (index !== -1) {
          clients.splice(index, 1);
        }
      }
    });
  });
  
  // API Routes
  
  // Authentication routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // In a real app, we would use bcrypt to compare passwords
      // For this MVP, we're doing a simple comparison
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      return res.status(200).json({ 
        message: 'Login successful', 
        user 
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Failed to login' });
    }
  });
  
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userInsertSchema = insertUserSchema.extend({
        email: z.string().email("Valid email is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(1, "Username is required")
      });
      
      const validatedData = userInsertSchema.parse(req.body);
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create new user
      const user = await storage.createUser({
        ...validatedData,
        verified: true
      });
      
      return res.status(201).json({ message: 'Registration successful', user });
    } catch (error) {
      console.error('Register error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ message: 'Failed to register' });
    }
  });
  
  // Contacts routes
  app.get('/api/contacts/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Get all contacts for this user
      const contacts = await storage.getContactsByUserId(userId);
      
      // Get full user details for each contact
      const contactsWithDetails = await Promise.all(
        contacts.map(async (contact) => {
          const contactUser = await storage.getUserById(contact.contactId);
          return {
            ...contact,
            contactUser
          };
        })
      );
      
      return res.status(200).json(contactsWithDetails);
    } catch (error) {
      console.error('Get contacts error:', error);
      return res.status(500).json({ message: 'Failed to get contacts' });
    }
  });
  
  app.post('/api/contacts', async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      
      // Create new contact
      const contact = await storage.createContact(validatedData);
      
      // Get contact user details
      const contactUser = await storage.getUserById(contact.contactId);
      
      return res.status(201).json({ 
        message: 'Contact added successfully', 
        contact: {
          ...contact,
          contactUser
        }
      });
    } catch (error) {
      console.error('Add contact error:', error);
      return res.status(500).json({ message: 'Failed to add contact' });
    }
  });
  
  // Sync contacts from email address book (simulated)
  app.post('/api/contacts/sync', async (req: Request, res: Response) => {
    try {
      const { userId, emails } = req.body;
      
      if (!userId || !emails || !Array.isArray(emails)) {
        return res.status(400).json({ message: 'User ID and emails array are required' });
      }
      
      // Validate email format for all emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emails) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            message: `Invalid email format: ${email}`,
            validationError: true
          });
        }
      }
      
      // Find users with the provided emails
      const foundContacts = [];
      
      for (const email of emails) {
        const user = await storage.getUserByEmail(email);
        
        if (user && user.id !== userId) {
          // Check if this contact already exists for the user
          const existingContacts = await storage.getContactsByUserId(userId);
          const alreadyAdded = existingContacts.some(contact => contact.contactId === user.id);
          
          if (!alreadyAdded) {
            // Add as a new contact with default name (can be changed later)
            const newContact = await storage.createContact({
              userId,
              contactId: user.id,
              contactName: user.username
            });
            
            foundContacts.push({
              ...newContact,
              contactUser: user
            });
          }
        }
      }
      
      return res.status(200).json({ 
        message: 'Contacts synced successfully', 
        addedContacts: foundContacts
      });
    } catch (error) {
      console.error('Sync contacts error:', error);
      return res.status(500).json({ message: 'Failed to sync contacts' });
    }
  });
  
  // Conversations routes
  app.get('/api/conversations/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Get all conversations for this user
      const conversations = await storage.getConversationsByUserId(userId);
      
      // Get details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          // Get the other participant
          const otherParticipantId = conversation.participantA === userId 
            ? conversation.participantB 
            : conversation.participantA;
          
          const otherParticipant = await storage.getUserById(otherParticipantId);
          
          // Get latest message
          const messages = await storage.getMessagesByConversationId(conversation.id);
          const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          
          // Count unread messages
          const unreadCount = messages.filter(msg => 
            msg.senderId !== userId && msg.status !== 'read'
          ).length;
          
          return {
            ...conversation,
            otherParticipant,
            latestMessage,
            unreadCount
          };
        })
      );
      
      // Sort by last message time
      conversationsWithDetails.sort((a, b) => {
        // Handle potentially null lastMessageTime values
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      
      return res.status(200).json(conversationsWithDetails);
    } catch (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({ message: 'Failed to get conversations' });
    }
  });
  
  app.post('/api/conversations', async (req: Request, res: Response) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      
      // Check if conversation already exists
      const existingConversation = await storage.getConversationByParticipants(
        validatedData.participantA,
        validatedData.participantB
      );
      
      if (existingConversation) {
        return res.status(200).json({ 
          message: 'Conversation already exists', 
          conversation: existingConversation 
        });
      }
      
      // Create new conversation
      const conversation = await storage.createConversation(validatedData);
      
      return res.status(201).json({ 
        message: 'Conversation created successfully', 
        conversation 
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      return res.status(500).json({ message: 'Failed to create conversation' });
    }
  });
  
  // Messages routes
  app.get('/api/messages/:conversationId', async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }
      
      // Get all messages for this conversation
      const messages = await storage.getMessagesByConversationId(conversationId);
      
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Failed to get messages' });
    }
  });
  
  // Users routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Get user
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Failed to get user' });
    }
  });
  
  return httpServer;
}
