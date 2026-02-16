const BubbleMessage = ({ role, content }: { role: string; content: string }) => {
  const isUser = role === "user";

  return (
    <div className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none"
            : "bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 rounded-tl-none"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <div className={`text-[10px] mt-2 opacity-50 ${isUser ? "text-right" : "text-left"}`}>
          {isUser ? "You" : "Caro"}
        </div>
      </div>
    </div>
  );
};

export default BubbleMessage;