import { useState, useRef, useEffect } from "react";
import BubbleMessage from "./BubbleMessage";

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hola! Soy Caro, tu asistente virtual. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Entiendo perfectamente. Déjame procesar esa información por ti..." },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Caro AI
        </h2>
        <p className="text-sm text-gray-400">Siempre activa para ayudarte</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, index) => (
          <BubbleMessage key={index} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 border-t border-white/10">
        <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 px-6 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;