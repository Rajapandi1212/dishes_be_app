import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import v1Router from './routers';

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome' });
});

app.use('/api/v1', v1Router);

// Middleware for handling 404 errors
app.use((req: Request, res: Response) => {
  console.log('Request not found:', req?.path);
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
});

app.listen(8000, () => {
  console.log(`Server is running on http://localhost:${8000}`);
});
