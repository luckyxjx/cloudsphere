import { useState, useRef, useEffect } from 'react';

const randomNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery'];

function ChatApp() {
  const [users] = useState(randomNames);
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [chats, setChats] = useState<{ [user: string]: { text: string; sender: 'user' | 'bot' }[] }>({});
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Ensure chat history exists for selected user
  useEffect(() => {
    setChats(prev => ({ ...prev, [selectedUser]: prev[selectedUser] || [] }));
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedUser]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setChats(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), { text: input, sender: 'user' }]
    }));
    setInput('');
    setTimeout(() => {
      setChats(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), { text: 'Bot reply: ' + input, sender: 'bot' }]
      }));
    }, 500);
  };

  const messages = chats[selectedUser] || [];

  return (
    <div className="w-full h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col py-4">
        <div className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Users</div>
        <ul className="flex-1 overflow-y-auto">
          {users.map(user => (
            <li key={user}>
              <button
                className={`w-full text-left px-4 py-2 rounded transition-colors mb-1 ${
                  selectedUser === user
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                {user}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-none shadow-none border-0">
          <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-700 text-lg text-gray-700 dark:text-gray-200 font-semibold bg-gray-50 dark:bg-gray-900">
            Chatting with: <span className="text-blue-500">{selectedUser}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-2 flex flex-col justify-end">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[60%] px-4 py-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white self-end ml-auto'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-2 bg-gray-50 dark:bg-gray-900">
            <input
              className="flex-1 p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none"
              placeholder={`Message ${selectedUser}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;