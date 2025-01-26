import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navbar } from "@/components/ui/navbar"; 

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface TypingState {
  isTyping: boolean;
  text: string;
  fullText: string;
}

export default function NetworkAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m Stacks Blockchain Assistant. Ask me about:\n- Stacks Blockchain features\n- Layer 2 scaling\n- Smart contract development\n- Network performance'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState<TypingState>({
    isTyping: false,
    text: '',
    fullText: ''
  });
  const [isScrolled, setIsScrolled] = useState(false);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing.text]);

  useEffect(() => {
    if (typing.isTyping && typing.text !== typing.fullText) {
      const timeout = setTimeout(() => {
        setTyping(prev => ({
          ...prev,
          text: prev.fullText.slice(0, prev.text.length + 3)
        }));
      }, 10);
      return () => clearTimeout(timeout);
    } else if (typing.isTyping && typing.text === typing.fullText) {
      setTyping(prev => ({ ...prev, isTyping: false }));
      setMessages(prev => [...prev, { role: 'assistant', content: typing.fullText }]);
    }
  }, [typing]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setTyping({
        isTyping: true,
        text: '',
        fullText: data.message
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistant response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar isScrolled={isScrolled} />
      <main className="flex-1 flex flex-col container mx-auto px-4 pt-20 pb-4">
        <div className="flex-1 flex flex-col bg-orange-900/10 border border-orange-500/20 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center space-x-3 p-4 border-b border-orange-500/20">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-400/20 to-orange-600/20">
              <Brain className="h-6 w-6 text-orange-400" />
            </div>
            <span className="text-xl bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Stacks Blockchain Assistant
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.role === 'assistant' 
                      ? 'bg-orange-500/10 text-white'
                      : 'bg-orange-600 text-white'
                  } rounded-lg p-3`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                  ) : (
                    <User className="h-5 w-5 mt-1 flex-shrink-0" />
                  )}
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {typing.isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[85%] bg-orange-500/10 text-white rounded-lg p-3">
                  <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {typing.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll to bottom reference */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit} 
            className="p-4 border-t border-orange-500/20 flex space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Stacks Blockchain..."
              className="flex-1 bg-orange-500/10 border-orange-500/20 text-white placeholder:text-white/40"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-orange-600 hover:bg-orange-500"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}