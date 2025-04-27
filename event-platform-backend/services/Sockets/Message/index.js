const { Server } = require('socket.io');
const MessageService = require('../../messageService')

function socketInit(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Новый пользователь:', socket.id);

    socket.on('join_event', (eventId) => {
      socket.join(eventId.toString());
      console.log(`Пользователь ${socket.id} зашел в комнату события ${eventId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { request_id, sender, recipient, context } = data;

        const newMessage = await MessageService.createMessage({ request_id: request_id, sender: sender, recipient: recipient, context: context });

        //io.to(request_id.toString()).emit('receive_message', newMessage);
        io.emit('receive_message', newMessage);
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Пользователь отключился:', socket.id);
    });
  });

  return io;
}

module.exports = socketInit;
