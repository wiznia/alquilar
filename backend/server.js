import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './listingSchema.js';
import User from './userSchema.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cloudinary from 'cloudinary';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

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
      estado: String
      expensas: Float
      moneda: [String]
      owner: ID
      precio_max: Float
      precio_min: Float
      provincia: String
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
    estado: String
    expensas: Float
    fotos: [File]
    id: ID!
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
    telefono: Int
    tipo_de_cuenta: String!
    token: String
    usuario: String!
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
    login(email: String!, password: String!): User
    resetPassword(token: String!, newPassword: String!): Boolean
    requestPasswordReset(email: String!): Boolean
    uploadImage(files: [Upload]!, userId: ID!): [File]!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    user: async (_, __, context) => {
      if (!context.req || !context.req.headers) {
        throw new Error('Request headers not found');
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
      const listing = await Listing.findById(id).populate('owner');
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
  },
  Mutation: {
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
        telefono: newUser.telefono,
        tipo_de_cuenta: newUser.tipo_de_cuenta,
        token,
        usuario: newUser.usuario,
      };
    },
    login: async (_, { email, password }) => {
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

      return { id: user.id, email: user.email, token };
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
    uploadImage: async (_, { files, userId }) => {
      if (!files || files.length === 0) {
        throw new Error('No files provided.');
      }

      const uploadPromises = files.map(async (file) => {
        const { createReadStream, filename } = await file;

        const stream = createReadStream();
        console.log(userId);

        const uploadResult = await new Promise((resolve, reject) => {
          const cloudinaryStream = cloudinary.v2.uploader.upload_stream(
            { folder: 'alquilar' },
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
        console.log(fileObject);
        return fileObject;
      });

      const results = await Promise.all(uploadPromises);

      return results;
    },
  },
  Listing: {
    owner: async (listing) => {
      return await User.findById(listing.owner);
    },
  },
};

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  }),
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
