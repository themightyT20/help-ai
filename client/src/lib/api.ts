import { Message, Conversation, User, Settings } from "@shared/schema";

// Base API helper
async function apiRequest<T>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> {
  // Check if we're in guest mode
  const isGuestMode = localStorage.getItem('guest-mode') === 'true';
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add guest mode header if applicable
  if (isGuestMode) {
    headers["x-guest-mode"] = "true";
  }

  const response = await fetch(`/api${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Chat API functions
export async function sendMessage(message: string, conversationId: number): Promise<{
  userMessage: Message;
  assistantMessage: Message;
}> {
  return apiRequest("POST", "/chat", { message, conversationId });
}

// Conversation API functions
export async function getConversations(): Promise<Conversation[]> {
  return apiRequest("GET", "/conversations");
}

export async function getConversation(id: number): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  return apiRequest("GET", `/conversations/${id}`);
}

export async function createConversation(title: string): Promise<Conversation> {
  return apiRequest("POST", "/conversations", { title });
}

export async function deleteConversation(id: number): Promise<void> {
  return apiRequest("DELETE", `/conversations/${id}`);
}

// User API functions
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiRequest("GET", "/me");
  } catch (error) {
    return null;
  }
}

// Search API functions
export async function searchWeb(query: string): Promise<any> {
  return apiRequest("POST", "/search", { query });
}

// Code API functions
export async function generateCodeDownload(code: string, language: string, filename?: string): Promise<{
  success: boolean;
  downloadUrl: string;
  filename: string;
}> {
  return apiRequest("POST", "/code/download", { code, language, filename });
}

// API key functions
export async function saveApiKeys(
  togetherApiKey?: string, 
  stabilityApiKey?: string,
  seperDevApiKey?: string
): Promise<{
  hasTogetherApiKey: boolean;
  hasStabilityApiKey: boolean;
  hasSeperDevApiKey: boolean;
}> {
  return apiRequest("POST", "/api-keys", { 
    togetherApiKey, 
    stabilityApiKey,
    seperDevApiKey
  });
}

export async function getApiKeysStatus(): Promise<{
  hasTogetherApiKey: boolean;
  hasStabilityApiKey: boolean;
  hasSeperDevApiKey: boolean;
}> {
  return apiRequest("GET", "/api-keys");
}

// Image generation API
export async function generateImage(params: {
  prompt: string;
  negativePrompt?: string;
  stylePreset?: string;
  width?: number;
  height?: number;
  samples?: number;
  conversationId?: number;
}): Promise<{
  images: Array<{
    imageUrl: string;
    seed: number;
    finishReason: string;
  }>;
  prompt: string;
  width: number;
  height: number;
  stylePreset?: string;
}> {
  return apiRequest("POST", "/image/generate", params);
}

// Settings
export const defaultSettings: Settings = {
  theme: "system",
  temperature: 0.7,
  maxTokens: 1024,
  saveConversations: true,
  useLocalStorageOnly: false,
};

export function loadSettings(): Settings {
  try {
    const savedSettings = localStorage.getItem("help-ai-settings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return defaultSettings;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem("help-ai-settings", JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}
