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
import { GraphQLUpload } from 'graphql-upload';
import { generarContratoPDF } from './generarContrato.js';
import { handleNotification } from './helpers.js';
import { pubsub } from './pubsub.js';
import mongoose from 'mongoose';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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
            <p>${nombre} ${apellido} te envió un mensaje${listingId ? ` por tu <a href=${process.env.FRONTEND_URL}/listing/${listingId}>publicación</a> en Alquil.AR:` : `:`}</p>
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
      const user = await User.findOne({
        email,
      });

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

      return { id: user.id, email: user.email, token, nombre: user.nombre };
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

      const listing = await Listing.findById(id);
      if (!listing) throw new Error('Listing not found');

      if (senderId) {
        const sender = await User.findById(senderId).select(
          'nombre apellido tipo_de_cuenta',
        );
        const inmuebleURL =
          sender.tipo_de_cuenta === 'Dueño'
            ? `${process.env.FRONTEND_URL}/account/alquileres/configListing/documents?id=${id}`
            : `${process.env.FRONTEND_URL}/account/listings/configListing/documents?id=${id}`;

        const isPaymentConfigured = !!listing.payment?.cbu || !!listing.sena;

        // 📄 Documentación
        if (input.documentation) {
          const incomingDocs = Array.isArray(input.documentation)
            ? input.documentation
            : [input.documentation];

          const existingDocs = Array.isArray(listing.documentation)
            ? listing.documentation
            : [];

          const existingDocsMap = new Map(
            existingDocs.map((doc) => [doc.id.toString(), doc]),
          );

          incomingDocs.forEach((doc) => {
            existingDocsMap.set(doc.id.toString(), doc);
          });

          updatedFields.documentation = Array.from(existingDocsMap.values());

          const CBUContent =
            !isPaymentConfigured &&
            listing.contract?.documents &&
            listing.contract?.potentialTenantAgreed &&
            sender.tipo_de_cuenta !== 'Dueño'
              ? ' Configurá tu seña o CBU para recibir la reserva del potencial inquilino.'
              : '';

          const contractContent =
            listing?.contract?.documents.length === 0 &&
            sender.tipo_de_cuenta !== 'Dueño'
              ? ' Ya podés subir tu modelo de contrato de alquiler para que sea revisado por el inquilino.'
              : '';

          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> subió documentación a <a href=${inmuebleURL}>${listing.direccion}</a>.${CBUContent} ${contractContent}`;

          if (sender.tipo_de_cuenta === 'Dueño') {
            listing.potential_tenant.forEach((tenant) =>
              handleNotification(
                senderId,
                tenant,
                notificationContent,
                'listing',
                id,
              ),
            );
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

        // 📃 Contrato
        if (input.contract) {
          const incomingContract = Array.isArray(input.contract)
            ? input.contract[0]
            : input.contract;

          const existingContract = listing.contract?.toObject?.() || {};
          const mergedContract = {
            ...existingContract,
            ...incomingContract,
          };

          if (incomingContract.contractStartDate) {
            mergedContract.contractStartDate =
              incomingContract.contractStartDate;
          }
          if (incomingContract.contractDuration) {
            mergedContract.contractDuration = incomingContract.contractDuration;
          }
          if (incomingContract.contractAdjustmentType) {
            mergedContract.contractAdjustmentType =
              incomingContract.contractAdjustmentType;
          }
          if (incomingContract.contractAdjustmentMethod) {
            mergedContract.contractAdjustmentMethod =
              incomingContract.contractAdjustmentMethod;
          }

          updatedFields.contract = mergedContract;

          // Notificación por subida de contrato
          const includesContractUpload =
            incomingContract.nombre ||
            incomingContract.apellido ||
            incomingContract.documents?.length;

          if (includesContractUpload) {
            notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> subió el contrato de alquiler a <a href=${inmuebleURL}>${listing.direccion}</a>.`;

            listing.potential_tenant.forEach((tenant) =>
              handleNotification(
                senderId,
                tenant,
                notificationContent,
                'listing',
                id,
              ),
            );
          }

          // Notificación por aceptación/rechazo
          if (
            typeof incomingContract.potentialTenantAgreed === 'boolean' &&
            sender.tipo_de_cuenta !== 'Dueño'
          ) {
            if (incomingContract.potentialTenantAgreed === true) {
              const CBUContent =
                !isPaymentConfigured && listing.contract?.documents
                  ? ' Configurá tu seña o CBU para recibir la reserva del potencial inquilino.'
                  : '';
              notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> aceptó el contrato de alquiler de <a href=${inmuebleURL}>${listing.direccion}</a>. ${CBUContent}`;
              updatedFields.tenant = [sender._id];
            } else {
              notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> rechazó el contrato de alquiler de <a href=${inmuebleURL}>${listing.direccion}</a>.`;
              updatedFields.tenant = null;
            }

            handleNotification(
              senderId,
              listing.owner,
              notificationContent,
              'listing',
              id,
            );
          }
        }

        // 💸 Payment
        if (input.payment) {
          const existingPayment = listing.payment?.toObject?.() || {};
          updatedFields.payment = {
            ...existingPayment,
            ...input.payment,
          };
        }

        // Sena
        if (input.sena && !input.payment?.cbu) {
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> configuró el valor de la seña de <a href=${process.env.FRONTEND_URL}/account/alquileres/configListing?id=${listing.id}>${listing.direccion}</a>.`;
          listing.potential_tenant.forEach((tenant) =>
            handleNotification(
              senderId,
              tenant,
              notificationContent,
              'listing',
              id,
            ),
          );
        }

        // 🏦 CBU
        if (input.payment?.cbu && !input.sena) {
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> configuró su CBU para <a href=${process.env.FRONTEND_URL}/account/alquileres/configListing?id=${listing.id}>${listing.direccion}</a>.`;
          listing.potential_tenant.forEach((tenant) =>
            handleNotification(
              senderId,
              tenant,
              notificationContent,
              'listing',
              id,
            ),
          );
        }

        if (input.payment?.paymentDone) {
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> pagó el valor de la seña de <a href=${process.env.FRONTEND_URL}/account/configListing?id=${listing.id}>${listing.direccion}</a>. Ya podés <a href="${process.env.FRONTEND_URL}/account/calendar">agendar</a> la fecha para firmar el contrato!`;

          handleNotification(
            senderId,
            listing.owner,
            notificationContent,
            'listing',
            id,
          );
        }

        if (input.signature) {
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> confirmó que la firma del contrato fue existosa. Ya estás alquilando, felicidades!`;
          const tenant = listing.tenant;

          handleNotification(
            senderId,
            tenant,
            notificationContent,
            'listing',
            id,
          );

          await Listing.findByIdAndUpdate(id, {
            $set: {
              estado: ['Alquilado'],
            },
          });
        }

        if (input.contract?.contractVoidReason) {
          notificationContent = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> rescindió tu contrato de alquiler por ${input.contract.contractVoidReason} con la nota: ${input.contract.contractNote}`;
          const tenant = listing.tenant;

          handleNotification(
            senderId,
            tenant,
            notificationContent,
            'listing',
            id,
          );

          const updated = await Listing.findByIdAndUpdate(
            id,
            {
              $set: {
                estado: ['Activo'],
                'payment.paymentDone': false,
                signature: false,
              },
              $pull: {
                documentation: false,
                potential_tenant: tenant,
              },
              $unset: {
                'payment.mpPaymentId': '',
                'payment.status': '',
                precioLastAdjustmentDate: '',
                tenant: '',
                'contract.documents': '',
                'contract.potentialTenantAgreed': '',
                'contract.contractStartDate': '',
                'contract.contractDuration': '',
                'contract.contractAdjustmentType': '',
                'contract.contractAdjustmentMethod': '',
                'contract.contractExpiring': '',
              },
            },
            { new: true },
          );
          await User.findByIdAndUpdate(tenant, {
            $unset: { potential_tenant: '' },
          });

          return updated;
        }
      }

      // 🖼 Fotos
      if (input.fotos) {
        updatedFields.fotos = input.fotos.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          extension: file.extension,
        }));
      }

      // 🔁 Resto de campos simples
      Object.entries(input).forEach(([key, value]) => {
        if (
          !['documentation', 'contract', 'fotos', 'payment'].includes(key) &&
          !(key in updatedFields)
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
    rateUser: async (_, { senderId, receiverId, rating, message }) => {
      const ratedUser = await User.findById(receiverId);

      if (!ratedUser) {
        throw new Error('User not found');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }

      const existingRating = ratedUser.ratings.find(
        (r) => r.user.toString() === senderId,
      );

      if (existingRating) {
        existingRating.rating = rating;
        existingRating.message = message;
      } else {
        const ratingObject = {
          user: senderId,
          rating,
          message,
        };
        ratedUser.ratings.push(ratingObject);
      }

      await ratedUser.save();
      return ratedUser;
    },
    replyRating: async (_, { senderId, receiverId, message }) => {
      const repliedUser = await User.findById(senderId);
      const myReply = repliedUser.ratings.find(
        (reply) => reply.user.toString() === receiverId,
      );

      if (!repliedUser) {
        throw new Error('User not found');
      }

      const replyObject = {
        user: senderId,
        message,
      };
      myReply.replies.push(replyObject);

      await repliedUser.save();
      return repliedUser;
    },
    sendMessage: async (_, { receiverId, asunto }, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const actualSenderId = decoded.userId;
      let existingThread = await Message.findOne({
        $or: [
          { sender: actualSenderId, receiver: receiverId },
          { sender: receiverId, receiver: actualSenderId },
        ],
      });
      const conversationId =
        existingThread?.conversationId || crypto.randomUUID();
      const messageData = {
        asunto,
        createdAt: new Date(),
        messageId: crypto.randomUUID(),
        senderId: actualSenderId,
        readBy: [actualSenderId],
        conversationId,
      };

      const sender =
        await User.findById(actualSenderId).select('nombre apellido');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${actualSenderId}>${sender.nombre} ${sender.apellido}</a> te envió un <a href=${process.env.FRONTEND_URL}/account/messages>mensaje</a>.`;

      handleNotification(actualSenderId, receiverId, content, 'message');

      if (existingThread) {
        existingThread.messages.push(messageData);
        await existingThread.save();
        await existingThread.populate('sender receiver');
        await pubsub.publish('NEW_MESSAGE', { newMessage: messageData });
        return existingThread;
      }
      const newConversation = new Message({
        sender: actualSenderId,
        receiver: receiverId,
        conversationId,
        messages: [messageData],
      });
      await newConversation.save();

      await newConversation.populate('sender receiver');
      await pubsub.publish('NEW_MESSAGE', { newMessage: messageData });
      return newConversation;
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
      if (process.env.NODE_ENV === 'development') {
        await Listing.findByIdAndUpdate(listingId, {
          mercadoPago: {
            userId: 'TEST_USER_ID',
            accessToken: process.env.MERCADO_PAGO_TEST_ACCESS_TOKEN,
            tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });

        return null;
      }

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
                title: `Reserva del inmueble ${listing.direccion}`,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: parseFloat(value),
              },
            ],
            external_reference: listingId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create payment link: ${errorData.message}`);
      }

      const data = await response.json();

      await Listing.findByIdAndUpdate(listingId, {
        mpPaymentLink:
          process.env.NODE_ENV === 'development'
            ? data.sandbox_init_point
            : data.init_point,
        sena: value,
      });

      return process.env.NODE_ENV === 'development'
        ? data.sandbox_init_point
        : data.init_point;
    },
    addPotentialTenant: async (
      _,
      { tenantId, listingId, senderId, receiverId, type },
    ) => {
      const listing = await Listing.findByIdAndUpdate(listingId, {
        $addToSet: { potential_tenant: tenantId },
      });

      await User.findByIdAndUpdate(receiverId, {
        potential_tenant: [listingId],
      });

      const sender = await User.findById(senderId).select('nombre apellido');

      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> te dio acceso como potencial inquilino en <a href=${process.env.FRONTEND_URL}/listing/${listingId}>${listing.direccion}</a>.<a class="button button--small" href=${process.env.FRONTEND_URL}/account/alquileres/configListing?id=${listingId}>Ir a la configuración</a>`;

      await handleNotification(senderId, receiverId, content, type, listingId);

      return true;
    },
    removePotentialTenant: async (
      _,
      { listingId, senderId, receiverId, type },
    ) => {
      const receiverObjectId = new mongoose.Types.ObjectId(String(receiverId));
      const listing = await Listing.findByIdAndUpdate(listingId, {
        $pull: {
          potential_tenant: receiverId,
          documentation: { id: receiverObjectId },
        },
        $unset: { contract: { potentialTenantAgreed: false } },
      });

      await User.findByIdAndUpdate(receiverId, {
        $unset: { potential_tenant: '' },
      });

      const sender = await User.findById(senderId).select('nombre apellido');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> removió tu acceso como potencial inquilino en <a href=${process.env.FRONTEND_URL}/listing/${listingId}>${listing.direccion}</a>.`;

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
      const listing = await Listing.findById(listingId);

      if (!sender) {
        throw new Error('Sender user not found');
      }

      const id = crypto.randomUUID();
      const day = new Date(date).getDate();
      const month = new Date(date).getMonth() + 1;
      const fullMonth = month.toString().padStart(2, '0');
      const content = `<a href=${process.env.FRONTEND_URL}/user/${senderId}>${sender.nombre} ${sender.apellido}</a> agendó una <a href="/account/calendar"}>visita</a> a ${listing.direccion} para el día ${day}/${fullMonth}`;

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
    generateContract: async (_, { input, listingId }) => {
      const fileName = await generarContratoPDF(input);
      const url = `http://localhost:4000/output/${fileName.fileName}`;

      await Listing.findByIdAndUpdate(listingId, {
        contract: {
          url,
          hash: fileName.hash,
        },
      });

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
  ReplyData: {
    user: async (parent) => {
      if (!parent.user) return null;
      return await User.findById(parent.user);
    },
  },
  Subscription: {
    notificationReceived: {
      subscribe: (_, { userId }, { pubsub }) =>
        pubsub.asyncIterableIterator(`NOTIFICATION_RECEIVED_${userId}`),
    },
    newMessage: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterableIterator('NEW_MESSAGE'),
    },
    newPayment: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterableIterator('NEW_PAYMENT'),
    },
  },
};

export default resolvers;
