export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface QuickAction {
  label: string;
  prompt: string;
  icon?: string;
}

export interface ChatbotConfig {
  module: string;
  title: string;
  quickActions: QuickAction[];
  welcomeMessage?: string;
}

export interface ChatApiRequest {
  module: string;
  message: string;
}

export interface ChatApiResponse {
  response: string;
  module: string;
  success: boolean;
  error?: string;
}