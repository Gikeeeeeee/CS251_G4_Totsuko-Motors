import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import usePartRoutes from './add-part-usage/add-part-usage.route'

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route (เอาไว้ให้ FE ยิงมาเทสว่า BE ติดหรือยัง)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Totsuko Motors API is running!' 
  });
});
app.use('/api/use-part', usePartRoutes)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
