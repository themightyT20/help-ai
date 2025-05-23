import { useState, useCallback, useEffect } from "react";
import { Message, Conversation } from "@shared/schema";
import { createConversation, getConversation, sendMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

type ChatMessage = {
  id?: number;
  content: string;
  role: "user" | "assistant" | "system";
  isLoading?: boolean;
  timestamp?: Date;
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();
  
  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("Auth context not available:", error);
  }

  const loadConversation = useCallback(async (conversationId: number) => {
    try {
      setIsLoading(true);
      const data = await getConversation(conversationId);
      setConversation(data.conversation);
      
      // Convert API messages to ChatMessage format
      const chatMessages = data.messages.map(message => ({
        id: message.id,
        content: message.content,
        role: message.role as "user" | "assistant",
        timestamp: new Date(message.timestamp),
      }));
      
      setMessages(chatMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startNewConversation = useCallback(async (initialTitle = "New Conversation") => {
    try {
      setIsLoading(true);
      
      // Add the x-guest-mode header if in guest mode
      const isGuestMode = localStorage.getItem('guest-mode') === 'true';
      const headers: Record<string, string> = {};
      
      if (isGuestMode) {
        headers['x-guest-mode'] = 'true';
      }
      
      const newConversation = await createConversation(initialTitle);
      setConversation(newConversation);
      setMessages([]);
      return newConversation.id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create a new conversation",
        variant: "destructive",
      });
      console.error("Failed to create a new conversation:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversation) return;

    // Optimistically add user message
    const userMessage: ChatMessage = {
      content,
      role: "user",
      timestamp: new Date(),
    };
    
    // Add loading message for assistant
    const loadingMessage: ChatMessage = {
      content: "",
      role: "assistant",
      isLoading: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => {
      // Generate temporary IDs for optimistic updates to prevent duplicate keys
      const tempUserMessageId = Date.now();
      const tempLoadingMessageId = Date.now() + 1;
      return [
        ...prev, 
        {...userMessage, id: tempUserMessageId}, 
        {...loadingMessage, id: tempLoadingMessageId}
      ];
    });

    try {
      // The API will automatically include guest mode header if needed
      const response = await sendMessage(content, conversation.id);
      
      // Update messages with real data
      setMessages(prev => {
        // First, let's filter out any temporary messages (for both user and loading assistant messages)
        // The temporary messages are added with Date.now() as IDs which are much larger than DB IDs
        // We'll filter them out by removing messages that don't have proper DB IDs
        const filtered = prev.filter(msg => {
          // Keep messages that have server-generated IDs (typically small numbers)
          // or that aren't the ones we just sent (the last two messages)
          const isRecentTempMessage = !msg.id || msg.id > Date.now() - 60000;
          return msg.id && !isRecentTempMessage;
        });
        
        // Add the real messages from the server
        return [
          ...filtered,
          {
            id: response.userMessage.id,
            content: response.userMessage.content,
            role: "user",
            timestamp: new Date(response.userMessage.timestamp),
          },
          {
            id: response.assistantMessage.id,
            content: response.assistantMessage.content,
            role: "assistant",
            timestamp: new Date(response.assistantMessage.timestamp),
          }
        ];
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove loading message
        
        newMessages.push({
          content: "Sorry, I encountered an error processing your request. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        });
        
        return newMessages;
      });
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [conversation, toast]);

  return {
    messages,
    isLoading,
    conversation,
    loadConversation,
    startNewConversation,
    sendUserMessage,
  };
}
