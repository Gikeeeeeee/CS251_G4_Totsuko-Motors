import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import serviceJobRoutes from './service-job/service-job.route'; 
import usePartRoutes from './add-part-usage/add-part-usage.route'
import addServiceRoute from './modules/add-service/route';
import getPurchasingPartsRoute from './modules/get-purchasing-parts/route';
import clerkDashboardRouter from './modules/clerk-dashboard/route';

import authRoutes from './routes/auth.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/service', addServiceRoute);
app.use('/api/parts', getPurchasingPartsRoute);
app.use('/api/use-part', usePartRoutes)
app.use('/service', clerkDashboardRouter);
app.use('/api/service-job', serviceJobRoutes);

// Health Check Route (เอาไว้ให้ FE ยิงมาเทสว่า BE ติดหรือยัง)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Totsuko Motors API is running!' 
  });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
