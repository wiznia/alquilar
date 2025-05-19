import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  asunto: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  notified: { type: Boolean },
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
