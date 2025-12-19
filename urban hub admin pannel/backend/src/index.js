import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/api', publicRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
