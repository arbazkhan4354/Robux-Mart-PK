import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../../lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  chatUserId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, accessToken } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    if (isOpen && user && accessToken) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      pollInterval.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [isOpen, user, accessToken]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!user || !accessToken) return;

    try {
      const response = await fetch(`${API_URL}/chat/${user.id}`, {
        headers: getAuthHeaders(accessToken),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        const newMessagesCount = data.messages.length;
        if (newMessagesCount > prevMessagesCount.current && !isOpen) {
          setUnreadCount(newMessagesCount - prevMessagesCount.current);
        }
        prevMessagesCount.current = newMessagesCount;
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          chatUserId: user.id,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="relative">
          <Button
            size="lg"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setUnreadCount(0);
            }}
            className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50"
          >
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </Button>
          {unreadCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold"
            >
              {unreadCount}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-xs text-muted-foreground">We typically reply within minutes</p>
              </div>

              {/* Messages */}
              <ScrollArea className="h-96 p-4" ref={scrollRef as any}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto mb-3 text-muted-foreground" size={40} />
                      <p className="text-sm text-muted-foreground">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.senderId === user.id
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.isAdmin && msg.senderId !== user.id && (
                            <p className="text-xs font-semibold mb-1 text-yellow-400">Admin</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-purple-200' : 'text-muted-foreground'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};