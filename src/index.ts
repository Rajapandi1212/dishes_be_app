import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import v1Router from './routers';

const app: Express = express();
app.use(
  cors({
    origin: ['http://localhost:3000', '*'],
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: 'http://localhost:3000', // Allow only your frontend to access
//     methods: ['GET', 'POST'],
//     allowedHeaders: '*',
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log('API CALL :', req?.url, req?.path, req?.query);
  next();
});

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
