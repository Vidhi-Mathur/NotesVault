import { Schema, Document, model } from "mongoose";

export interface INote extends Document {
    title: string;
    content: string;
}

const noteSchema = new Schema<INote>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})

export const Note = model<INote>("Note", noteSchema)