import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import userRouter from './routes/user.route';
import categoryRouter from './routes/category.route';
import transactionRouter from './routes/transaction.route';
import statisticRouter from './routes/statistic.route';
import balanceRouter from './routes/balance.route';
import errorMiddleware from './middlewares/errors.middleware';

const app: Application = express();

const PORT: string | number = process.env.PORT || 4999;
const DB_URI: string = process.env.MONGO_URI!;

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://qeorqer.github.io'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }),
);

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/statistic', statisticRouter);
app.use('/api/balance', balanceRouter);
app.use(errorMiddleware);

const start = () => {
  try {
    mongoose.connect(
      DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      },
      (err) => {
        if (err) {
          throw new Error(`Connection to DB: ${err.message}`);
        }

        app.listen(PORT, () => console.log(`App is running on a ${PORT} port`));
      },
    );
  } catch (e) {
    console.log('Server Error', e.message);
    process.exit(1);
  }
};

app.get('/', (req: Request, res: Response) => {
  res.json('content will be here');
});

start();
