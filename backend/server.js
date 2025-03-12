import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './listingSchema.js';

dotenv.config();

mongoose.connect(process.env.DATABASE_URL, {});

const typeDefs = `
  type Query {
    getListings(
      searchTerm: String 
      tipo_de_alquiler: [String]
      moneda: [String]
      tipo_de_propiedad: [String]
      precio_min: Float
      precio_max: Float
      antiguedad_max: Int
      superficie_total_min: Int
      superficie_total_max: Int
      ammenities: [String]
      tipo_de_ambientes: [String]
      skip: Int = 0
      first: Int
      sortBy: SortOrder
      createdAt_min: String
      createdAt_max: String
    ): ListingsResult
    getListingById(id: ID!): Listing
    count: Count
  }

  type ListingsResult {
    count: Int
    listings: [Listing]
  }

  type Listing {
    id: String!
    titulo: String!
    tipo_de_alquiler: String!
    moneda: String!
    tipo_de_propiedad: String!
    direccion: String!
    localidad: String
    barrio: String
    descripcion: String
    estado: String
    precio: Float!
    expensas: Float
    ambientes: Int
    dormitorios: Int
    banos: Int
    superficie_cubierta: Int
    superficie_total: Int
    ammenities: String
    tipo_de_ambientes: String
    antiguedad_max: Int
    fotos: [Foto]
    owner: Owner
    viewCount: Int
    createdAt: String
  }

  type Foto {
    id: ID
    image: Image
  }

  type Image {
    publicUrlTransformed: String
  }
  
  type Owner {
    account: String
  }

  type Count {
    count: Int
  }

  input CreateListingInput {
    id: String!
    titulo: String!
    tipo_de_alquiler: String!
    moneda: String!
    tipo_de_propiedad: String!
    direccion: String!
    localidad: String!
    barrio: String!
    descripcion: String!
    estado: String!
    precio: Float!
    expensas: Float
    ambientes: Int
    dormitorios: Int
    banos: Int
    superficie_cubierta: Int
    superficie_total: Int
    ammenities: String
    tipo_de_ambientes: String
    antiguedad_max: Int
    fotos: [FotoInput]
    owner: OwnerInput
    viewCount: Int
  }

  input FotoInput {
    id: ID
    image: ImageInput
  }

  input ImageInput {
    publicUrlTransformed: String
  }

  input OwnerInput {
    account: String
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
    createListing(input: CreateListingInput!): Listing
  }
`;

const resolvers = {
  Query: {
    getListings: async (_, args) => {
      const filter = {};

      if (args.searchTerm) {
        filter.$or = [
          { titulo: { $regex: args.searchTerm, $options: 'i' } },
          { descripcion: { $regex: args.searchTerm, $options: 'i' } },
          { localidad: { $regex: args.searchTerm, $options: 'i' } },
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
      const listing = await Listing.findById(id);
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
    createListing: async (args) => {
      const {
        id,
        titulo,
        tipo_de_alquiler,
        tipo_de_propiedad,
        direccion,
        localidad,
        barrio,
        descripcion,
        estado,
        precio,
        expensas,
        ambientes,
        dormitorios,
        banos,
        superficie_cubierta,
        superficie_total,
        antiguedad_max,
        fotos,
        owner,
      } = args.input;
      const newListing = new Listing({
        id,
        titulo,
        tipo_de_alquiler,
        tipo_de_propiedad,
        direccion,
        localidad,
        barrio,
        descripcion,
        estado,
        precio,
        expensas,
        ambientes,
        dormitorios,
        banos,
        superficie_cubierta,
        superficie_total,
        antiguedad_max,
        fotos,
        owner,
        viewCount: 0,
        createdAt: new Date(),
      });
      return await newListing.save();
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log(`Server running at: ${url}`);
