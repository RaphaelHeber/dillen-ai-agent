import express, { Request, Response } from 'express';
import cors from 'cors';
import userProfileRouter from './routes/userProfile';
import { requestLogger, responseTimeLogger, errorLogger } from './middleware/logging';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(responseTimeLogger);
app.use('/api/users', userProfileRouter);
app.use(errorLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

const port = process.env.PORT || 4002;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;