import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './listingSchema.js';
import User from './userSchema.js';
import Message from './messageSchema.js';
import Notification from './notificationSchema.js';
import Event from './eventSchema.js';
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
import { handleNotification } from './helpers.js';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs-extra';
import puppeteer from 'puppeteer';

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
      barrio: String
      direccion: String
      email: String
      id: ID
      localidad: String
      nombre: String
      provincia: String
      token: String
      tipo_de_cuenta: String
      usuario: String
      potential_tenant: [ID]
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
      potential_tenant: [ID]
      precio_max: Float
      precio_min: Float
      provincia: String
      sena: Float
      sortBy: SortOrder
      superficie_total_max: Int
      superficie_total_min: Int
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
    getNotifications(userId: ID!): [Notification]
    getPotentialTenantsByListing(ids: [ID!]!): [User]
    getTenantUser(nombre: String!, apellido: String!, tipo_de_cuenta: String!, potential_tenant: [String!], invite: [String]): [User]
    getUserListingNotifications(userId: ID!, listingId: ID!): [Notification]
    getCalendarEvents(senderId: ID!, createdAt_min: String!, createdAt_max: String!): [Event!]!
    getCalendarEventsByInvitee(receiverId: ID!, createdAt_min: String!, createdAt_max: String!): [Event!]!
  }

  type ListingsResult {
    count: Int
    listings: [Listing]
  }

  type MercadoPagoData {
    userId: String
    accessToken: String
  }

  input MercadoPagoInput {
    userId: String
    accessToken: String
  }

  type ContractData {
    id: ID
    nombre: String
    apellido: String
    documents: [File]
    potentialTenantAgreed: Boolean
  }

  input ContractDataInput {
    id: ID
    nombre: String
    apellido: String
    documents: [FileInput]
  }

  input MercadoPagoInput {
    userId: String
    accessToken: String
  }

  type Listing {
    ambientes: Int
    ammenities: [String]
    antiguedad_max: Int
    banos: Int
    barrio: String
    contract: ContractData
    descripcion: String
    direccion: String!
    documentation: [DocumentationData]
    dormitorios: Int
    estado: [String]
    expensas: Float
    fotos: [File]
    id: ID!
    likes: [User]
    mercadoPago: MercadoPagoData
    moneda: String!
    mpPaymentLink: String
    owner: User!
    payment: PaymentData
    potential_tenant: [ID]
    potentialTenantAgreed: Boolean
    precio: Float!
    provincia: String!
    sena: Float
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

  type DocumentationData {
    id: ID
    nombre: String
    apellido: String
    documents: [File]
  }

  type PaymentData {
    cbu: String
    alias: String
  }

  type User {
    apellido: String!
    barrio: String
    celular: Int
    condicion_fiscal: String!
    direccion: String
    dni: Int!
    email: String!
    id: ID!
    localidad: String
    nombre: String!
    provincia: String
    ratings: [Rating]
    telefono: Int
    tipo_de_cuenta: String!
    token: String
    usuario: String!
    documentation: Documentation
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

  type Notification {
    content: String!
    createdAt: String!
    id: ID!
    listingId: [Listing!]
    read: Boolean!
    receiver: User
    sender: User
    type: String!
  }

  type Event {
    titulo: String!
    asunto: String!
    date: String!
    time: String!
    senderId: User
    receiverId: User
    id: String
    listingId: Listing
  }

  type Rating {
    user: User
    rating: Int!
    message: String
    createdAt: String!
  }

  type Documentation {
    documentsAreGlobal: Boolean
    documents: [File]
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
    id: ID
    ambientes: Int
    ammenities: [String]
    antiguedad_max: Int
    banos: Int
    barrio: String
    contract: ContractDataInput
    descripcion: String
    direccion: String
    documentation: [DocumentationDataInput]
    dormitorios: Int
    estado: [String!]
    expensas: Float
    fotos: [FileInput!]
    likes: [ID]
    mercadoPago: MercadoPagoInput
    moneda: String
    municipio: String
    owner: ID
    payment: PaymentInput
    potential_tenant: [ID]
    potentialTenantAgreed: Boolean
    precio: Float
    provincia: String
    sena: Float
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String
    titulo: String
    toilettes: Int
    viewCount: Int
  }

  input UpdateUserInput {
    nombre: String
    apellido: String
    email: String
    provincia: String
    barrio: String
    localidad: String
    telefono: Int
    documentation: [DocumentsDataInput]
  }

  input ContractInput {
    adjustmentMethod: String
    adjustmentType: String
    apellido: String
    apellidoTenant: String
    bankAccount: String
    bankName: String
    cbu: String
    contractSignDate: String
    contractStartDate: String
    cuit: String
    direccion: String
    direccionTenant: String
    dni: Int
    DNITenant: Int
    duracion: String
    guaranteeType: String
    inventory: String
    listingAddress: String
    listingCity: String
    listingMoneda: String
    listingPrice: Int
    nombre: String
    nombreTenant: String
    provincia: String
    provinciaTenant: String
  }

  type File {
    id: ID!
    name: String
    url: String
    extension: String
  }

  input FileInput {
    id: String
    name: String
    url: String
    extension: String
  }

  input DocumentationDataInput {
    id: ID
    nombre: String
    apellido: String
    documents: [FileInput]
  }

  input DocumentsDataInput {
    documentsAreGlobal: Boolean
    documents: [FileInput]
  }

  input PaymentInput {
    cbu: String,
    alias: String
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
      apellido: String!
      barrio: String!
      celular: Int
      condicion_fiscal: String!
      direccion: String
      dni: Int!
      email: String!
      localidad: String
      nombre: String!
      password: String!
      provincia: String!
      telefono: Int
      tipo_de_cuenta: String!
      usuario: String!
    ): User
    createListing(input: CreateListingInput!): Listing
    updateListing(id: ID!, input: UpdateListingInput!, senderId: ID): Listing
    updateUser(id: ID!, input: UpdateUserInput!): Boolean
    deleteListing(id: ID!): Boolean
    login(email: String!, password: String!): User
    logout: Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
    requestPasswordReset(email: String!): Boolean
    uploadImage(files: [Upload]!, userId: ID!, listingId: ID!): [File]!
    uploadDocuments(files: [Upload]!, userId: ID!): [File]!
    likeListing(listingId: ID!): Listing
    rateOwner(ownerId: ID!, rating: Int!, message: String): User
    sendMessage(senderId: ID, receiverId: ID!, asunto: String!, conversationId: String): Message
    sendEmail(nombre: String!, apellido: String!, email: String!, asunto: String!, receiverEmail: String!, listingId: String!): Boolean
    markMessagesAsRead(messageIds: [ID!]!): [SingleMessage!]!
    markNotificationsAsRead(notifications: [ID!]!): Boolean
    connectMercadoPago(listingId: ID!): String
    disconnectMercadoPago(listingId: ID!): String
    createPaymentLink(userId: ID!, value: Float!, listingId: ID!): String
    addPotentialTenant(tenantId: ID!, listingId: ID!, senderId: ID!, receiverId: ID!, type: String!): Boolean
    removePotentialTenant(listingId: ID!, senderId: ID!, receiverId: ID!, type: String!): Boolean
    setCalendarEvent(titulo: String!, asunto: String!, time: String!, date: String!, senderId: ID!, receiverId: [ID!]!, listingId: ID): Event!
    deleteCalendarEvent(eventId: String!): Boolean
    generateContract(input: ContractInput!): String!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    user: async (_, __, context) => {
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
    getPotentialTenantsByListing: async (_, { ids }) => {
      return await User.find({ _id: { $in: ids } });
    },
    getTenantUser: async (
      _,
      { nombre, apellido, tipo_de_cuenta, potential_tenant, invite },
    ) => {
      const query = {
        tipo_de_cuenta,
        $or: [
          { nombre: { $regex: '^' + nombre, $options: 'i' } },
          { apellido: { $regex: '^' + apellido, $options: 'i' } },
        ],
      };

      if (potential_tenant) {
        query.potential_tenant = { $nin: [potential_tenant] };
      }

      if (invite) {
        query.invite = { $nin: [invite] };
      }

      return await User.find(query);
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

      if (args.potential_tenant) {
        filter.potential_tenant = { $in: args.potential_tenant };
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
        listing.potential_tenant = listing.potential_tenant.map((id) =>
          id?.toString(),
        );
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
    getNotifications: async (_, { userId }) => {
      return await Notification.find({ receiver: userId, read: false });
    },
    getUserListingNotifications: async (_, { userId, listingId }) => {
      return await Notification.find({
        receiver: userId,
        listingId: listingId,
      });
    },
    getCalendarEvents: async (
      _,
      { senderId, createdAt_min, createdAt_max },
      context,
    ) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.userId !== senderId) {
        throw new Error('Unauthorized access');
      }

      const events = await Event.find({
        senderId,
        date: {
          $gte: createdAt_min,
          $lte: createdAt_max,
        },
      });

      return events;
    },
    getCalendarEventsByInvitee: async (
      _,
      { receiverId, createdAt_min, createdAt_max },
      context,
    ) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.userId !== receiverId) {
        throw new Error('Unauthorized access');
      }

      const events = await Event.find({
        receiverId: [receiverId],
        date: {
          $gte: createdAt_min,
          $lte: createdAt_max,
        },
      });

      return events;
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
        barrio,
        celular,
        condicion_fiscal,
        direccion,
        dni,
        email,
        localidad,
        nombre,
        password,
        provincia,
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
        barrio,
        celular,
        condicion_fiscal,
        direccion,
        dni,
        email,
        localidad,
        nombre,
        password: hashedPassword,
        provincia,
        ratings: [],
        telefono,
        tipo_de_cuenta,
        usuario,
      });
      await newUser.save();
      const token = jwt.sign(
        { userId: newUser.id, tipo_de_cuenta: newUser.tipo_de_cuenta },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        },
      );

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
        barrio: newUser.barrio,
        celular: newUser.celular,
        condicion_fiscal: newUser.condicion_fiscal,
        direccion: newUser.direccion,
        dni: newUser.dni,
        email: newUser.email,
        id: newUser.id,
        localidad: newUser.localidad,
        nombre: newUser.nombre,
        provincia: newUser.provincia,
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
      const token = jwt.sign(
        { userId: user.id, tipo_de_cuenta: user.tipo_de_cuenta },
        process.env.JWT_SECRET,
        {
          expiresIn: '7 days',
        },
      );

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

      const token = jwt.sign(
        { userId: user.id, tipo_de_cuenta: user.tipo_de_cuenta },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        },
      );

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
    updateListing: async (_, { id, input, senderId }) => {
      const updatedFields = {};
      let notificationContent = null;

      if (senderId) {
        const sender = await User.findById(senderId).select(
          'nombre apellido tipo_de_cuenta',
        );
        const inmuebleURL =
          sender.tipo_de_cuenta === 'Dueño'
            ? `${process.env.FRONTEND_URL}/account/alquileres/configListing/documents?id=${id}`
            : `${process.env.FRONTEND_URL}/account/listings/configListing/documents?id=${id}`;
        const listing = await Listing.findById(id);

        if (input.documentation) {
          const incoming = Array.isArray(input.documentation)
            ? input.documentation[0]
            : input.documentation;
          const existingDocs = Array.isArray(listing.documentation)
            ? listing.documentation
            : [];
          const getId = (obj) =>
            obj && obj.id ? obj.id.toString() : undefined;
          const otherDocs = existingDocs.filter(
            (doc) => getId(doc) !== getId(incoming),
          );
          const mergedDocs = [...otherDocs, incoming];
          updatedFields.documentation = mergedDocs;

          const isPaymentConfigured = !!listing.payment.cbu || !!listing.sena;
          const CBUContent =
            !isPaymentConfigured &&
            listing.contract?.documents &&
            listing.potentialTenantAgreed &&
            sender.tipo_de_cuenta !== 'Dueño'
              ? ' Configurá tu seña o CBU para recibir la reserva del potencial inquilino.'
              : '';
          const contractContent =
            listing?.contract?.documents.length === 0 &&
            sender.tipo_de_cuenta !== 'Dueño'
              ? ' Ya podés subir tu modelo de contrato de alquiler para que sea revisado por el inquilino.'
              : '';
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> subió documentación al <a href=${inmuebleURL}>inmueble</a>.${CBUContent} ${contractContent}`;
          if (sender.tipo_de_cuenta === 'Dueño') {
            listing.potential_tenant.forEach((tenant) => {
              handleNotification(
                senderId,
                tenant,
                notificationContent,
                'listing',
                id,
              );
            });
          } else {
            handleNotification(
              senderId,
              listing.owner,
              notificationContent,
              'listing',
              id,
            );
          }
        }
        if (input.contract) {
          const incomingContract = Array.isArray(input.contract)
            ? input.contract[0]
            : input.contract;
          updatedFields.contract = incomingContract;

          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> subió el contrato de alquiler al <a href=${inmuebleURL}>inmueble</a>.`;
          listing.potential_tenant.forEach((tenant) => {
            handleNotification(
              senderId,
              tenant,
              notificationContent,
              'listing',
              id,
            );
          });
        }

        if (input.potentialTenantAgreed === false) {
          updatedFields.potentialTenantAgreed = input.potentialTenantAgreed;

          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> rechazó el contrato de alquiler del <a href=${inmuebleURL}>inmueble</a>.`;
          handleNotification(
            senderId,
            listing.owner,
            notificationContent,
            'listing',
            id,
          );
        } else {
          updatedFields.potentialTenantAgreed = input.potentialTenantAgreed;

          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> aceptó el contrato de alquiler del <a href=${inmuebleURL}>inmueble</a>.`;
          handleNotification(
            senderId,
            listing.owner,
            notificationContent,
            'listing',
            id,
          );
        }
      }

      if (input.fotos) {
        updatedFields.fotos = input.fotos.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          extension: file.extension,
        }));
      }

      Object.entries(input).forEach(([key, value]) => {
        if (
          !(key in updatedFields) &&
          key !== 'documentation' &&
          key !== 'contract' &&
          key !== 'fotos' &&
          key !== 'potentialTenantAgreed'
        ) {
          updatedFields[key] = value;
        }
      });

      const updatedListing = await Listing.findOneAndUpdate(
        { _id: id },
        { $set: updatedFields },
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
        return [];
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
          extension: uploadResult.format,
        };

        return fileObject;
      });

      const results = await Promise.all(uploadPromises);

      return results;
    },
    uploadDocuments: async (_, { files, userId }) => {
      if (!files || files.length === 0) {
        return [];
      }

      const uploadPromises = files.map(async (file) => {
        const { createReadStream, filename } = await file;

        const stream = createReadStream();

        const uploadResult = await new Promise((resolve, reject) => {
          const cloudinaryStream = cloudinary.v2.uploader.upload_stream(
            { folder: `alquilar/${userId}/documents` },
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
          extension: uploadResult.format,
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

      const sender =
        await User.findById(actualSenderId).select('nombre apellido');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> te envió un <a href=${process.env.FRONTEND_URL}/account/messages>mensaje</a>.`;

      handleNotification(senderId, receiverId, content, 'message');

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

      return updatedMessages;
    },
    markNotificationsAsRead: async (_, { notifications }) => {
      await Promise.all(
        notifications.map((id) =>
          Notification.findByIdAndUpdate(id, { read: true }),
        ),
      );
      return true;
    },
    connectMercadoPago: async (_, { listingId }) => {
      const listing = await Listing.findById(listingId);
      if (!listing) throw new Error('Listing not found');

      const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${process.env.MERCADO_PAGO_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${process.env.MERCADO_PAGO_REDIRECT_URI}&state=${listingId}`;

      return authUrl;
    },
    disconnectMercadoPago: async (_, { listingId }) => {
      await Listing.findByIdAndUpdate(listingId, {
        $unset: { mercadoPago: '', mpPaymentLink: '' },
      });

      return true;
    },
    createPaymentLink: async (_, { value, listingId }) => {
      const listing = await Listing.findById(listingId);
      if (
        !listing ||
        !listing.mercadoPago ||
        !listing.mercadoPago.accessToken
      ) {
        throw new Error('Mercado Pago account not connected');
      }

      const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${listing.mercadoPago.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                title: 'Payment via Application',
                quantity: 1,
                currency_id: 'ARS',
                unit_price: parseFloat(value),
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create payment link: ${errorData.message}`);
      }

      const data = await response.json();

      await Listing.findByIdAndUpdate(listingId, {
        mpPaymentLink: data.init_point,
        sena: value,
      });

      return data.init_point;
    },
    addPotentialTenant: async (
      _,
      { tenantId, listingId, senderId, receiverId, type },
    ) => {
      await Listing.findByIdAndUpdate(listingId, {
        $addToSet: { potential_tenant: tenantId },
      });

      await User.findByIdAndUpdate(receiverId, {
        potential_tenant: [listingId],
      });

      const sender = await User.findById(senderId).select('nombre apellido');

      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> te dio acceso como potencial inquilino en su <a href=${process.env.FRONTEND_URL}/listing/${listingId}>inmueble</a>.<a class="button button--small" href=${process.env.FRONTEND_URL}/account/alquileres/configListing?id=${listingId}>Ir a la configuración</a>`;

      await handleNotification(senderId, receiverId, content, type, listingId);

      return true;
    },
    removePotentialTenant: async (
      _,
      { listingId, senderId, receiverId, type },
    ) => {
      await Listing.findByIdAndUpdate(listingId, {
        $pull: { potential_tenant: receiverId },
      });

      await User.findByIdAndUpdate(receiverId, {
        $unset: { potential_tenant: '' },
      });

      const sender = await User.findById(senderId).select('nombre apellido');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> removió tu acceso como potencial inquilino en su <a href=${process.env.FRONTEND_URL}/listing/${listingId}>inmueble</a>.`;

      await handleNotification(senderId, receiverId, content, type, listingId);

      return true;
    },
    setCalendarEvent: async (
      _,
      { titulo, asunto, time, date, senderId, receiverId, listingId },
      context,
    ) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const actualSenderId = decoded.userId;
      const sender =
        await User.findById(actualSenderId).select('nombre apellido');

      if (!sender) {
        throw new Error('Sender user not found');
      }

      const id = crypto.randomUUID();
      const day = new Date(date).getDate();
      const month = new Date(date).getMonth() + 1;
      const fullMonth = month.toString().padStart(2, '0');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> agendó una visita a su inmueble para el día ${day}/${fullMonth}`;

      await Promise.all(
        receiverId.map(async (receiver) => {
          await handleNotification(
            senderId,
            receiver,
            content,
            'event',
            listingId,
          );
        }),
      );

      const event = new Event({
        id,
        titulo,
        asunto,
        time,
        date,
        senderId,
        receiverId,
        listingId,
      });

      await event.save();

      return event;
    },
    deleteCalendarEvent: async (_, { eventId }) => {
      await Event.deleteOne({ _id: eventId });

      return true;
    },
    generateContract: async (_, { input }) => {
      const fileName = await generarContratoPDF(input);
      const url = `http://localhost:${PORT}/output/${fileName}`;
      return url;
    },
    updateUser: async (_, { id, input }) => {
      const user = await User.findById(id);

      if (!user) {
        throw new Error('User not found');
      }

      if (
        input.documentation &&
        Array.isArray(input.documentation) &&
        input.documentation.length > 0
      ) {
        const docData = input.documentation[0];

        if (Array.isArray(docData.documents)) {
          user.documentation.documents = docData.documents;
        }
        if (typeof docData.documentsAreGlobal !== 'undefined') {
          user.documentation.documentsAreGlobal = docData.documentsAreGlobal;
        }
        user.markModified('documentation');
      }

      await user.save();
      return true;
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
  Event: {
    senderId: async (event) => {
      return await User.findById(event.senderId);
    },
    receiverId: async (event) => {
      return await User.findById(event.receiverId);
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
app.use('/output', express.static(path.resolve('./output')));

app.get('/api/mercado-pago/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new Error(
        'Authorization code or state is missing from the callback.',
      );
    }

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MERCADO_PAGO_CLIENT_ID,
        client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.MERCADO_PAGO_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth token exchange failed: ${errorData.message}`);
    }

    const { access_token, refresh_token, user_id, expires_in } =
      await response.json();
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await Listing.findByIdAndUpdate(state, {
      mercadoPago: {
        userId: user_id,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/mp/success?userId=${state}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/mp/failure?error=${encodeURIComponent(error)}`,
    );
  }
});

const generarContratoPDF = async (datos) => {
  const [year, monthDate, today] = datos.contractSignDate
    .split('-')
    .map(Number);
  const [contractYear, contractMonth, contractDay] = datos.contractStartDate
    .split('-')
    .map(Number);
  const date = new Date(contractYear, contractMonth - 1, contractDay);
  const contractStartDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const month = new Date(`${year}-${monthDate}-${today}`).toLocaleDateString(
    'es-ES',
    {
      month: 'long',
    },
  );
  const duration = {
    'tres años': 3,
    'dos años': 2,
    'un año': 1,
    'seis meses': 6,
  };
  const duracion = duration[datos.duracion];
  const contractEndDateDate =
    duracion === 6
      ? new Date(
          new Date(datos.contractStartDate).setMonth(
            new Date(datos.contractStartDate).getMonth() + 6,
          ),
        )
      : new Date(
          `${contractYear + duracion}-${contractMonth.toString().replace(/^0+/, '')}-${contractDay}`,
        );
  const contractEndDate = contractEndDateDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const adjustment = {
    trimestral: 'trimestre',
    semestral: 'semestre',
    anual: 'año',
  };
  const contractTypeOfAdjustmentMonth = adjustment[datos.adjustmentType];
  const datosUpdates = {
    ...datos,
    todayDate: today,
    month,
    year,
    contractStartDate,
    contractEndDate,
    contractTypeOfAdjustmentMonth,
  };
  const htmlPath = path.resolve('./contractTemplate.html');
  const htmlTemplate = await fs.readFile(htmlPath, 'utf-8');
  const htmlFinal = htmlTemplate.replace(
    /{{(\w+)}}/g,
    (_, key) => datosUpdates[key] || '',
  );

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
  });

  await browser.close();

  const fileName = `contrato_final_${Date.now()}.pdf`;
  const outputPath = path.resolve('./output', fileName);
  await fs.outputFile(outputPath, pdfBuffer);

  return fileName;
};

/*const notifyPastEvents = async () => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const events = await Event.find({
    date: {
      $lte: oneDayAgo,
    },
    notified: { $ne: true },
  });

  for (const event of events) {
    const senderId = event.senderId;
    const sender = await User.findById(senderId).select('nombre apellido');
    const content = `Cómo estuvo la visita a "${event.titulo}"?. Agregá a <a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> como potencial inquilino si querés alquilarle tu inmueble.`;

    await handleNotification(senderId, senderId, content, 'event', null);

    event.notified = true;
    await event.save();
  }
};*/

//cron.schedule('*/2 * * * *', notifyPastEvents);

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

