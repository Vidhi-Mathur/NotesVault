import { NextFunction, Request, Response } from "express"
import { Note } from "../models/note-model"

export const getNotes = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const notes = await Note.find()
        return res.status(200).json({ notes })
    }
    catch(err){
        next(err)
    }
}
export const createNote = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content } = req.body
        if(!title.trim() || !content.trim()){
            throw new Error("Title / Content can't be empty")
        }
        const note = await Note.create({ title, content })
        return res.status(201).json({ note })
    }
    catch(err){
        next(err)
    }
}


export const updateNote = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title, content } = req.body
        if(!title.trim() || !content.trim()){
            throw new Error("Title / Content can't be empty")
        }
        const note = await Note.findByIdAndUpdate(id, { title, content }, { new: true })
        return res.status(200).json({ note })
    }
    catch(err) {
        next(err)
    }
}

export const deleteNote = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        await Note.findByIdAndDelete(id)
        return res.status(200).json({ message: 'Note deleted successfully' })
    }
    catch(err) {
        next(err)
    }
}