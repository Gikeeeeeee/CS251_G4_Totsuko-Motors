import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import serviceJobRoutes from './service-job/service-job.route'; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Totsuko Motors API is running!' 
  });
});


app.use('/api/service-job', serviceJobRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
