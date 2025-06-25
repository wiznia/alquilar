import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { graphqlUploadExpress } from 'graphql-upload';
import scheduleJobs from './jobs/cron.js';
import connectDB from './config/db.js';
import mercadopagoRoutes from './routes/mercadopago.js';
import { createApolloServer } from './services/graphql.js';

dotenv.config();

connectDB();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const app = express();
const httpServer = http.createServer(app);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
app.use('/output', express.static(path.resolve('./output')));
app.use('/api', mercadopagoRoutes);

scheduleJobs();

const apolloMiddleware = await createApolloServer(httpServer);

app.use(apolloMiddleware);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`Subscriptions ready at ws://localhost:${PORT}`);
});

