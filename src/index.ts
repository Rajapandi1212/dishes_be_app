import express, { Express, Request, Response } from 'express';

const app: Express = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome' });
});

// Middleware for handling 404 errors
app.use((req: Request, res: Response) => {
  console.log('Request not found:', req?.path);
  res.status(404).send({
    success: false,
    message: 'Not Found',
  });
});

app.listen(8000, () => {
  console.log(`Server is running on http://localhost:${8000}`);
});
