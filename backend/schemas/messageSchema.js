import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
      messageId: { type: String, required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readBy: { type: [String], default: [] },
    },
  ],
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
