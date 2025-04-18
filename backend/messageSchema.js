import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nombre: { type: String },
  apellido: { type: String },
  email: { type: String },
  conversationId: { type: String, required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      asunto: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      isUnread: { type: Boolean, default: true },
      messageId: { type: String, required: true },
    },
  ],
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
