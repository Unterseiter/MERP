import { useEffect, useState, useRef } from 'react';
import { FiCheck, FiX, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion'; // Нужен framer-motion для анимаций
import socket from '../../services/socket';
import EventService from '../../services/Event.service/event.service';
import MessageService from '../../services/message.service/message.service';
import DropdownMenu from './DropdownMenu';

export default function ChatPanel({ selectedRequest, isCreator, onAction }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesContainerRef = useRef(null);
  console.log("selectedRequest");
  console.log(selectedRequest);

  useEffect(() => {
    if (!selectedRequest) return;

    // Подключение
    if (!socket.connected) {
      socket.connect();
    }

    // Входим в комнату события (по request_id или event_id)
    socket.emit('join_event', selectedRequest.request_id);

    // Слушаем новые сообщения
    socket.on('receive_message', (message) => {
      console.log(message);
      if (message.request_id === selectedRequest.request_id) {
        setMessages(prev => [...prev, message]);
      }
    });

    fetchMessages(selectedRequest.request_id);

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [selectedRequest]);

  const fetchMessages = async (RequestId) => {
    try {
      const data = await MessageService.getRequestRecords(RequestId);
      //console.log(data);
      setMessages(data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const event = await EventService.getOneRecord(selectedRequest.event_id);

    const newMsg = {
      request_id: selectedRequest.request_id,
      sender: isCreator ? event.creator_tag : selectedRequest.user_tag,
      recipient: isCreator ? selectedRequest.user_tag : event.creator_tag,
      context: newMessage,
    };
    console.log(newMsg);

    socket.emit('send_message', newMsg);

    //setMessages(prev => [...prev, newMsg]);

    setNewMessage('');
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const start = container.scrollTop;
    const end = container.scrollHeight - container.clientHeight;
    const change = end - start;
    const duration = 400; // Длительность анимации (мс)
    let startTime = null;

    // Функция easing для плавности (easeOutQuad)
    const easeOutQuad = (t) => t * (2 - t);

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutQuad(progress);

      container.scrollTop = start + change * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col h-[65vh]">
      {selectedRequest ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Чат с {isCreator ? selectedRequest.user_tag : 'организатором'}</h3>
            {isCreator && (
              <DropdownMenu
                actions={[
                  {
                    label: 'Принять',
                    onClick: () => onAction(selectedRequest.request_id, 'accept'),
                  },
                  {
                    label: 'Отклонить',
                    onClick: () => onAction(selectedRequest.request_id, 'reject'),
                  },
                ]}
              />
            )}
          </div>

          <div ref={messagesContainerRef} className="flex-1 bg-gray-100 rounded p-2 mb-4 overflow-y-auto space-y-2 h-[500px]">
            {messages.length ? (
              messages.map((msg) => {
                const isOwnMessage = msg.sender === selectedRequest.user_tag;
                const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <motion.div
                    key={msg.message_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                  relative max-w-[70%] p-3 rounded-2xl min-h-[3.4rem] min-w-20
                  ${isOwnMessage
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-blue-500 text-white rounded-bl-none'
                        }
                `}
                    >
                      <p className="text-sm break-words">{msg.context}</p>
                      <span className="absolute text-[10px] text-gray-200 bottom-1 right-2">
                        {time}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500">Нет сообщений</p>
            )}
          </div>

          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
              placeholder="Введите сообщение..."
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FiSend />
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-400">Выберите заявку для начала чата</p>
      )}
    </div>
  );
}
