import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  verificationCodes, type VerificationCode, type InsertVerificationCode
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Verification operations
  getVerificationCode(phoneNumber: string): Promise<VerificationCode | undefined>;
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  deleteVerificationCode(phoneNumber: string): Promise<boolean>;
  
  // Contacts operations
  getContactsByUserId(userId: number): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(userId: number, contactId: number): Promise<boolean>;
  
  // Conversation operations
  getConversationById(id: number): Promise<Conversation | undefined>;
  getConversationByParticipants(userA: number, userB: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationLastMessageTime(id: number, time: Date): Promise<Conversation | undefined>;
  
  // Message operations
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private verificationCodes: Map<string, VerificationCode>;
  
  private userId: number;
  private contactId: number;
  private conversationId: number;
  private messageId: number;
  private verificationId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.verificationCodes = new Map();
    
    this.userId = 1;
    this.contactId = 1;
    this.conversationId = 1;
    this.messageId = 1;
    this.verificationId = 1;
    
    // Add some demo users
    this.createUser({
      phoneNumber: "+14155552671",
      username: "Sara Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      status: "Hey there! I'm using BancaMessenger."
    });
    
    this.createUser({
      phoneNumber: "+14155552672",
      username: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      status: "Available"
    });
    
    this.createUser({
      phoneNumber: "+14155552673",
      username: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
      status: "At work"
    });
    
    this.createUser({
      phoneNumber: "+14155552674",
      username: "David Kim",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      status: "In a meeting"
    });
  }

  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Verification code operations
  async getVerificationCode(phoneNumber: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      code => code.phoneNumber === phoneNumber
    );
  }

  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    // Delete any existing verification code for this phone number
    await this.deleteVerificationCode(code.phoneNumber);
    
    const id = this.verificationId++;
    const newCode: VerificationCode = { ...code, id, createdAt: new Date() };
    this.verificationCodes.set(code.phoneNumber, newCode);
    return newCode;
  }

  async deleteVerificationCode(phoneNumber: string): Promise<boolean> {
    return this.verificationCodes.delete(phoneNumber);
  }

  // Contact operations
  async getContactsByUserId(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      contact => contact.userId === userId
    );
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const newContact: Contact = { ...contact, id, createdAt: new Date() };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async deleteContact(userId: number, contactId: number): Promise<boolean> {
    const contact = Array.from(this.contacts.values()).find(
      c => c.userId === userId && c.contactId === contactId
    );
    if (!contact) return false;
    return this.contacts.delete(contact.id);
  }

  // Conversation operations
  async getConversationById(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByParticipants(userA: number, userB: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      conv => 
        (conv.participantA === userA && conv.participantB === userB) ||
        (conv.participantA === userB && conv.participantB === userA)
    );
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      conv => conv.participantA === userId || conv.participantB === userId
    );
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const newConversation: Conversation = { 
      ...conversation, 
      id, 
      lastMessageTime: new Date(),
      createdAt: new Date() 
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversationLastMessageTime(id: number, time: Date): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, lastMessageTime: time };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Message operations
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = { 
      ...message, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, newMessage);
    
    // Update the conversation's last message time
    if (message.conversationId) {
      await this.updateConversationLastMessageTime(message.conversationId, newMessage.timestamp);
    }
    
    return newMessage;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, status };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
