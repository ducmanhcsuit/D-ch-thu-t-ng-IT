
import React, { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from './types';
import { translateITTerm, translateITTermFromImage } from './services/geminiService';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là chatbot dịch thuật chuyên ngành IT. Hãy nhập một thuật ngữ tiếng Anh, tải ảnh hoặc dán ảnh chứa thuật ngữ để tôi dịch sang tiếng Việt.",
      sender: 'bot',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const translation = await translateITTerm(inputText);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: translation,
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Rất tiếc, đã có lỗi xảy ra: ${errorMessage}`);
      const errorBotMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `Rất tiếc, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.`,
        sender: 'bot',
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  const handleImageUpload = useCallback(async (file: File) => {
    if (isLoading) return;

    // Check for valid image type
    if (!file.type.startsWith('image/')) {
        setError("Tệp không hợp lệ. Vui lòng chỉ chọn tệp hình ảnh.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Url = reader.result as string;

      const userMessage: ChatMessage = {
        id: Date.now(),
        text: "Dịch thuật ngữ từ ảnh này:",
        sender: 'user',
        imageUrl: base64Url,
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const [header, data] = base64Url.split(',');
        if (!data) {
          throw new Error("Invalid image file format.");
        }
        const mimeType = header.match(/:(.*?);/)?.[1] ?? file.type;

        const translation = await translateITTermFromImage({ mimeType, data });

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: translation,
          sender: 'bot',
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Rất tiếc, đã có lỗi xảy ra khi xử lý ảnh: ${errorMessage}`);
        const errorBotMessage: ChatMessage = {
          id: Date.now() + 1,
          text: `Rất tiếc, tôi không thể xử lý ảnh của bạn lúc này. Vui lòng thử lại sau.`,
          sender: 'bot',
          isError: true,
        };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Không thể đọc tệp ảnh. Vui lòng thử lại.");
    };
  }, [isLoading]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault(); // Prevent default paste behavior
            handleImageUpload(file);
            break; // Handle only the first image
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleImageUpload]);


  return (
    <div className="bg-gray-900 text-gray-200 font-sans flex flex-col h-screen">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          IT Terminology Translator
        </h1>
        <p className="text-center text-sm text-gray-400 mt-1">Dịch thuật ngữ IT Anh-Việt với Gemini</p>
      </header>
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default App;