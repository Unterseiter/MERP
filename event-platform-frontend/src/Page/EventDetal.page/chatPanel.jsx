import { useEffect, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import socket from '../../services/socket';
import EventService from '../../services/Event.service/event.service';
import MessageService from '../../services/message.service/message.service';

export default function ChatPanel({ selectedRequest, isCreator, onAction }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!selectedRequest) return;

    // Подключение
    if (!socket.connected) {
      socket.connect();
    }

    // Входим в комнату события (по request_id или event_id)
    socket.emit('join_event', selectedRequest.event_id);

    // Слушаем новые сообщения
    socket.on('receive_message', (message) => {
      // Фильтрация по ивенту (чтобы случайно не поймать чужие сообщения)
      console.log(message);
      if (message.event_id === selectedRequest.event_id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // При загрузке можно запросить старые сообщения с сервера (если нужно)
    fetchMessages(selectedRequest.request_id);

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [selectedRequest]);

  const fetchMessages = async (RequestId) => {
    try {
      const data = await MessageService.getRequestRecords(RequestId);
      console.log(data);
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

    setMessages(prev => [...prev, newMsg]);

    setNewMessage('');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col h-full">
      {selectedRequest ? (
        <>
          <h3 className="font-semibold mb-2">Чат с {selectedRequest.user_tag}</h3>

          <div className="flex-1 bg-gray-100 rounded p-2 mb-4 overflow-y-auto space-y-2">
            {messages.length ? (
              messages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`p-2 rounded ${msg.recipient === selectedRequest.user_tag
                    ? 'bg-blue-200 self-start'
                    : 'bg-green-200 self-end'
                    }`}
                >
                  <p className="text-sm">{msg.context}</p>
                </div>
              ))
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
              Отправить
            </button>
          </div>

          {isCreator && (
            <div className="flex space-x-2">
              <button
                onClick={() => onAction(selectedRequest.request_id, 'accept')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FiCheck className="inline-block mr-1" /> Принять
              </button>
              <button
                onClick={() => onAction(selectedRequest.request_id, 'reject')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FiX className="inline-block mr-1" /> Отклонить
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Выберите заявку для начала чата</p>
      )}
    </div>
  );
}
