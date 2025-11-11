
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const messageBg = isUser
    ? 'bg-blue-600'
    : message.isError
    ? 'bg-red-800/50 border border-red-600'
    : 'bg-gray-700';
  const alignment = isUser ? 'items-end' : 'items-start';
  const bubbleAlignment = isUser ? 'rounded-br-none' : 'rounded-bl-none';

  return (
    <div className={`flex flex-col ${alignment} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${bubbleAlignment} ${messageBg}`}
      >
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Uploaded content" className="rounded-lg mb-2 max-h-48 w-full object-contain" />
        )}
        <p className="text-base break-words">{message.text}</p>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex items-start mb-4">
    <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none">
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);


interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onImageUpload, isLoading }) => {
    const [input, setInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
        // Reset file input value to allow uploading the same file again
        e.target.value = '';
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-800 border-t border-gray-700">
             <button
                type="button"
                onClick={handleImageButtonClick}
                className="mr-3 bg-gray-700 text-gray-300 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                disabled={isLoading}
                aria-label="Upload an image for translation"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                capture="environment"
                disabled={isLoading}
            />
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập thuật ngữ, dán hoặc tải ảnh..."
                className="flex-grow bg-gray-700 text-gray-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </form>
    );
};


interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onImageUpload: (file: File) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, error, onSendMessage, onImageUpload }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);


  return (
    <div className="flex flex-col flex-grow w-full max-w-3xl mx-auto">
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
            <div className="flex flex-col space-y-4">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>
        </main>
        {error && <p className="text-red-400 text-center text-sm pb-2 px-4">{error}</p>}
        <ChatInput onSendMessage={onSendMessage} onImageUpload={onImageUpload} isLoading={isLoading} />
    </div>
  );
};

export default ChatInterface;