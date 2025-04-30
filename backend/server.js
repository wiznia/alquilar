import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './listingSchema.js';
import User from './userSchema.js';
import Message from './messageSchema.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cloudinary from 'cloudinary';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

mongoose
  .connect(process.env.DATABASE_URL, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const typeDefs = `
  type Query {
    user(
      apellido: String
      email: String
      nombre: String
      token: String
      id: ID
    ): User
    getListings(
      ambientes: Int
      ammenities: [String]
      antiguedad_max: Int
      banos: Int
      barrio: String
      descripcion: String
      direccion: String
      dormitorios: Int
      estado: [String]
      expensas: Float
      likes: [String]
      moneda: [String]
      owner: ID
      precio_max: Float
      precio_min: Float
      provincia: String
      sortBy: SortOrder
      superficie_total_max: Int
      superficie_total_min: Int
      tenant: ID
      tipo_de_alquiler: [String]
      tipo_de_ambientes: [String]
      tipo_de_propiedad: [String]
      titulo: String
      toilettes: Int
      createdAt_max: String
      createdAt_min: String
      first: Int
      searchTerm: String 
      skip: Int = 0
    ): ListingsResult
    getListingById(id: ID!): Listing
    count: Int
    getUser(id: ID!): User
    getMessages(userId: ID!): [Message]
  }

  type ListingsResult {
    count: Int
    listings: [Listing]
  }

  type Listing {
    ambientes: Int
    ammenities: [String]
    antiguedad_max: Int
    banos: Int
    barrio: String
    descripcion: String
    direccion: String!
    dormitorios: Int
    estado: [String]
    expensas: Float
    fotos: [File]
    id: ID!
    likes: [User]
    moneda: String!
    owner: User!
    precio: Float!
    provincia: String!
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String!
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String!
    titulo: String!
    toilettes: Int
    createdAt: String
    viewCount: Int
  }

  type User {
    apellido: String!
    celular: Int
    condicion_fiscal: String!
    dni: Int!
    email: String!
    id: ID!
    nombre: String!
    ratings: [Rating]
    telefono: Int
    tipo_de_cuenta: String!
    token: String
    usuario: String!
  }
  
  type Message {
    sender: User
    receiver: User
    conversationId: String!
    messages: [SingleMessage!]!
  }

  type SingleMessage {
    asunto: String!
    createdAt: String!
    readBy: [String]
    messageId: ID!
    senderId: ID!
  }

  type Rating {
    user: User
    rating: Int!
    message: String
    createdAt: String!
  }

  scalar Upload

  input CreateListingInput {
    ambientes: Int!
    ammenities: [String]
    antiguedad_max: Int
    banos: Int!
    barrio: String!
    descripcion: String
    direccion: String!
    dormitorios: Int
    estado: String!
    expensas: Float
    fotos: [FileInput!]
    moneda: String!
    municipio: String
    precio: Float!
    provincia: String!
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String!
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String!
    titulo: String!
    toilettes: Int
    viewCount: Int
  }

  input UpdateListingInput {
    id: ID!
    ambientes: Int!
    ammenities: [String]
    antiguedad_max: Int
    banos: Int!
    barrio: String!
    descripcion: String
    direccion: String!
    dormitorios: Int
    estado: [String!]
    expensas: Float
    fotos: [FileInput!]
    likes: [ID]
    moneda: String!
    municipio: String
    owner: ID
    precio: Float!
    provincia: String!
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String!
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String!
    titulo: String!
    toilettes: Int
    viewCount: Int
  }

  type File {
    id: ID!
    name: String
    url: String
  }

  input FileInput {
    id: String
    name: String
    url: String
  }

  input SortListingsBy {
    order: SortOrder!
  }

  enum SortOrder {
    id_ASC
    precio_ASC
    precio_DESC
    createdAt_DESC
    viewCount_DESC
  }

  type Mutation {
    register(
      apellido: String!,
      celular: Int
      condicion_fiscal: String!,
      dni: Int!,
      email: String!,
      nombre: String!,
      password: String!,
      telefono: Int,
      tipo_de_cuenta: String!,
      usuario: String!,
    ): User
    createListing(input: CreateListingInput!): Listing
    updateListing(id: ID!, input: UpdateListingInput!): Listing
    deleteListing(id: ID!): Boolean
    login(email: String!, password: String!): User
    logout: Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
    requestPasswordReset(email: String!): Boolean
    uploadImage(files: [Upload]!, userId: ID!, listingId: ID!): [File]!
    likeListing(listingId: ID!): Listing
    rateOwner(ownerId: ID!, rating: Int!, message: String): User
    sendMessage(senderId: ID, receiverId: ID!, asunto: String!, conversationId: String): Message
    sendEmail(nombre: String!, apellido: String!, email: String!, asunto: String!, receiverEmail: String!, listingId: String!): Boolean
    markMessagesAsRead(messageIds: [ID!]!): [SingleMessage!]!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    user: async (_, __, context) => {
      if (!context.req || !context.req.headers) {
      }
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        return user;
      } catch (error) {
        throw new Error('Invalid token');
      }
    },
    getUser: async (_, { id }) => {
      return await User.findById(id).populate({
        path: 'ratings.user',
        select: 'nombre apellido',
      });
    },
    getListings: async (_, args) => {
      const filter = {};

      if (args.searchTerm) {
        filter.$or = [
          { titulo: { $regex: args.searchTerm, $options: 'i' } },
          { descripcion: { $regex: args.searchTerm, $options: 'i' } },
          { provincia: { $regex: args.searchTerm, $options: 'i' } },
          { direccion: { $regex: args.searchTerm, $options: 'i' } },
          { barrio: { $regex: args.searchTerm, $options: 'i' } },
        ];
      }

      if (args.tipo_de_alquiler) {
        filter.tipo_de_alquiler = { $in: args.tipo_de_alquiler };
      }
      if (args.moneda) {
        filter.moneda = { $in: args.moneda };
      }
      if (args.tipo_de_propiedad) {
        filter.tipo_de_propiedad = { $in: args.tipo_de_propiedad };
      }
      if (args.likes) {
        filter.likes = { $in: args.likes };
      }
      if (args.precio_min !== undefined || args.precio_max !== undefined) {
        filter.precio = {};
        if (args.precio_min !== undefined) {
          filter.precio.$gte = args.precio_min;
        }
        if (args.precio_max !== undefined) {
          filter.precio.$lte = args.precio_max;
        }
      }

      if (args.antiguedad_max !== undefined) {
        filter.antiguedad_max = {};
        if (args.antiguedad_max !== undefined) {
          filter.antiguedad_max.$lte = args.antiguedad_max;
        }
      }

      if (
        args.superficie_total_min !== undefined ||
        args.superficie_total_max !== undefined
      ) {
        filter.superficie_total = {};
        if (args.superficie_total_min !== undefined) {
          filter.superficie_total.$gte = args.superficie_total_min;
        }
        if (args.superficie_total_max !== undefined) {
          filter.superficie_total.$lte = args.superficie_total_max;
        }
      }
      if (args.ammenities) {
        filter.ammenities = { $in: args.ammenities };
      }

      if (args.tipo_de_ambientes) {
        filter.tipo_de_ambientes = { $in: args.tipo_de_ambientes };
      }

      if (args.createdAt_min || args.createdAt_max) {
        filter.createdAt = {};
        if (args.createdAt_min) {
          filter.createdAt.$gte = args.createdAt_min;
        }
        if (args.createdAt_max) {
          filter.createdAt.$lte = args.createdAt_max;
        }
      }

      if (args.owner) {
        filter.owner = { $in: args.owner };
      }

      if (args.estado) {
        filter.estado = { $in: args.estado };
      }

      const query = Listing.find(filter);

      if (args.sortBy) {
        const sortField = args.sortBy.split('_')[0];
        const sortOrder = args.sortBy.endsWith('_ASC') ? 1 : -1;
        query.sort({ [sortField]: sortOrder });
      }

      if (args.skip !== undefined) {
        query.skip(args.skip);
      }
      if (args.first !== undefined) {
        query.limit(args.first);
      }

      const listings = await query;
      const count = await Listing.countDocuments(filter);

      return {
        count,
        listings,
      };
    },
    getListingById: async (_, { id }) => {
      const listing = await Listing.findById(id)
        .populate('owner')
        .populate('likes');
      if (listing) {
        listing.viewCount += 1;
        await listing.save();
      }
      return listing;
    },
    count: async () => {
      const count = await Listing.countDocuments();
      return { count };
    },
    getMessages: async (_, { userId }) => {
      const conversations = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).populate('sender receiver');

      return conversations;
    },
  },
  Mutation: {
    sendEmail: async (
      _,
      { nombre, apellido, email, asunto, receiverEmail, listingId },
    ) => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.GOOGLE_ACCOUNT_USER,
            pass: process.env.GOOGLE_ACCOUNT_PASS,
          },
        });

        await transporter.sendMail({
          to: receiverEmail,
          from: 'no-reply@alquilar.com',
          replyTo: email,
          subject: `Nuevo mensaje desde Alquil.AR`,
          html: `
            <h2>Hola!</h2>
            <p>${nombre} ${apellido} te envió un mensaje por tu <a href=${process.env.FRONTEND_URL}/listing/${listingId}>publicación</a> en Alquil.AR:</p>
            <p>${asunto}</p>
    `,
        });
        console.log('Email enviado correctamente');
        return true;
      } catch (error) {
        console.error('Error enviando email:', error);
      }
    },
    register: async (
      _,
      {
        apellido,
        celular,
        condicion_fiscal,
        dni,
        email,
        nombre,
        password,
        telefono,
        tipo_de_cuenta,
        usuario,
      },
    ) => {
      const existingEmail = await User.findOne({ email });
      const existingUser = await User.findOne({ usuario });

      if (existingEmail) {
        throw new Error('Email already exists');
      }
      if (existingUser) {
        throw new Error('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        apellido,
        celular,
        condicion_fiscal,
        dni,
        email,
        nombre,
        password: hashedPassword,
        ratings,
        telefono,
        tipo_de_cuenta,
        usuario,
      });
      await newUser.save();
      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      try {
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.GOOGLE_ACCOUNT_USER,
            pass: process.env.GOOGLE_ACCOUNT_PASS,
          },
        });

        await transporter.sendMail({
          to: newUser.email,
          from: 'no-reply@alquilar.com',
          subject: 'Bienvenido a Alquil.AR!',
          html: `
      <p>Si necesitás ayuda, chequeá las <a href="http://${process.env.FRONTEND_URL}/faq">FAQs</a></p>
      <a href="http://${process.env.FRONTEND_URL}/">Entrar a Alquil.AR</a>
    `,
        });
        console.log('Email enviado correctamente');
      } catch (error) {
        console.error('Error enviando email:', error);
      }

      return {
        apellido: newUser.apellido,
        celular: newUser.celular,
        condicion_fiscal: newUser.condicion_fiscal,
        dni: newUser.dni,
        email: newUser.email,
        id: newUser.id,
        nombre: newUser.nombre,
        ratings: newUser.ratings,
        telefono: newUser.telefono,
        tipo_de_cuenta: newUser.tipo_de_cuenta,
        token,
        usuario: newUser.usuario,
      };
    },
    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return { id: user.id, email: user.email, token };
    },
    logout: async (_, __, { res }) => {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: 'Logout exitoso' };
    },
    requestPasswordReset: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GOOGLE_ACCOUNT_USER,
          pass: process.env.GOOGLE_ACCOUNT_PASS,
        },
      });

      await transporter.sendMail({
        to: user.email,
        from: 'no-reply@alquilar.com',
        subject: 'Reseteá tu contraseña',
        html: `
        <p>Clickeá en el link para resetear tu contraseña.</p>
        <a href="http://${process.env.FRONTEND_URL}/reset?token=${token}">Resetear contraseña</a>
      `,
      });

      return true;
    },

    resetPassword: async (_, { token, newPassword }) => {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        throw new Error('Invalid or expired token');
      }

      const user = await User.findOne({
        _id: decoded.userId,
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });

      if (!user) throw new Error('Invalid or expired token');

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await user.save();

      return true;
    },
    createListing: async (_, { input }, context) => {
      const {
        ambientes,
        ammenities,
        antiguedad_max,
        banos,
        barrio,
        descripcion,
        direccion,
        dormitorios,
        estado,
        expensas,
        fotos,
        moneda,
        municipio,
        precio,
        provincia,
        superficie_cubierta,
        superficie_total,
        tipo_de_alquiler,
        tipo_de_ambientes,
        tipo_de_propiedad,
        titulo,
        toilettes,
      } = input;
      const id = crypto.randomUUID();
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const owner = decoded.userId;
      const precioUpdated = precio * 100;
      const expensasUpdated = expensas * 100;

      const newListing = new Listing({
        ambientes,
        ammenities,
        antiguedad_max,
        banos,
        barrio,
        createdAt: new Date(),
        descripcion,
        direccion,
        dormitorios,
        estado,
        expensas: expensasUpdated,
        fotos,
        id,
        likes: [],
        moneda,
        municipio,
        owner,
        precio: precioUpdated,
        provincia,
        superficie_cubierta,
        superficie_total,
        tipo_de_alquiler,
        tipo_de_ambientes,
        tipo_de_propiedad,
        titulo,
        toilettes,
        viewCount: 0,
      });
      return await newListing.save();
    },
    updateListing: async (_, { id, input }, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const owner = decoded.userId;

      const updatedFields = {
        ...input,
        fotos: input.fotos
          ? input.fotos.map((file) => ({
              id: file.id,
              name: file.name,
              url: file.url,
            }))
          : undefined,
      };

      const updatedListing = await Listing.findOneAndUpdate(
        { _id: id, owner },
        updatedFields,
        { new: true },
      );

      return updatedListing;
    },
    deleteListing: async (_, { id }) => {
      await Listing.deleteOne({ _id: id });

      return true;
    },
    uploadImage: async (_, { files, userId, listingId }) => {
      if (!files || files.length === 0) {
        throw new Error('No files provided.');
      }

      const uploadPromises = files.map(async (file) => {
        const { createReadStream, filename } = await file;

        const stream = createReadStream();

        const uploadResult = await new Promise((resolve, reject) => {
          const cloudinaryStream = cloudinary.v2.uploader.upload_stream(
            { folder: `alquilar/${userId}/${listingId}` },
            (error, result) => {
              if (error) {
                reject(error);
              }
              resolve(result);
            },
          );

          stream.pipe(cloudinaryStream);
        });

        const fileObject = {
          id: uploadResult.public_id,
          name: filename,
          url: uploadResult.secure_url,
        };
        return fileObject;
      });

      const results = await Promise.all(uploadPromises);

      return results;
    },
    likeListing: async (_, { listingId }, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const likeIndex = listing.likes.indexOf(userId);
      if (likeIndex === -1) {
        listing.likes.push(userId);
      } else {
        listing.likes.splice(likeIndex, 1);
      }

      await listing.save();
      return listing.populate('likes');
    },
    rateOwner: async (_, { ownerId, rating, message }) => {
      const owner = await User.findById(ownerId);
      const user = {
        nombre: 'Pepito',
        apellido: 'Perez',
      };

      if (!owner) {
        throw new Error('Owner not found');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }

      const ratingObject = {
        user,
        rating,
        message,
      };

      owner.ratings.push(ratingObject);
      await owner.save();
      return owner;
    },
    sendMessage: async (_, { senderId, receiverId, asunto }, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const actualSenderId = decoded.userId;
      const readBy = senderId === actualSenderId ? [actualSenderId] : [];
      const messageData = {
        asunto,
        createdAt: new Date(),
        messageId: crypto.randomUUID(),
        senderId,
        readBy,
      };

      let existingThread = await Message.findOne({
        $or: [
          { sender: actualSenderId, receiver: receiverId },
          { sender: receiverId, receiver: actualSenderId },
        ],
      });

      if (existingThread) {
        existingThread.messages.push(messageData);
        await existingThread.save();

        return existingThread.populate('sender receiver');
      } else {
        const newConversation = new Message({
          sender: senderId,
          receiver: receiverId,
          conversationId: crypto.randomUUID(),
          messages: [messageData],
        });
        await newConversation.save();

        return newConversation.populate('sender receiver');
      }
    },
    markMessagesAsRead: async (_, { messageIds }, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      await Message.updateMany(
        {
          'messages.messageId': { $in: messageIds },
        },
        {
          $addToSet: { 'messages.$[elem].readBy': userId },
        },
        {
          arrayFilters: [
            {
              'elem.messageId': { $in: messageIds },
              'elem.readBy': { $ne: userId },
            },
          ],
        },
      );

      const updatedThreads = await Message.find({
        'messages.messageId': { $in: messageIds },
      });

      const updatedMessages = updatedThreads.flatMap((thread) =>
        thread.messages
          .filter((msg) => messageIds.includes(msg.messageId))
          .map((msg) => ({
            asunto: msg.asunto,
            createdAt: msg.createdAt.toISOString(),
            readBy: msg.readBy,
            messageId: msg.messageId,
            senderId: thread.sender.toString(),
          })),
      );

      console.log(updatedMessages);
      return updatedMessages;
    },
  },
  Listing: {
    likes: async (listing) => {
      return await User.find({ _id: { $in: listing.likes } });
    },
    owner: async (listing) => {
      return await User.findById(listing.owner);
    },
  },
};

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res }),
  }),
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
