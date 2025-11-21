import express from 'express'
import cors from 'cors';
import noteRoutes from './routes/note-route';
import { errorHandler } from './util/error';

export const app = express()

app.use(cors({
    origin: "*"
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', noteRoutes)

//Error Handling
app.use(errorHandler);