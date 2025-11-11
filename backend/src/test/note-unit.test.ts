import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Note } from '../models/note-model';
import { NextFunction, Request, Response } from 'express';
import { errorHandler } from '../util/error';
import { createNote, deleteNote, getNotes, updateNote } from '../controllers/note-controller';

//Mock the Note model
jest.mock('../models/note-model', () => {
    class Note {
        title?: string
        content?: string
         constructor(data: { title?: string; content?: string }) {
            this.title = data.title;
            this.content = data.content;
        }
        validateSync(){
            const errors: any = {}
            if (!this.title) errors.title = { message: "Title is required" }
            if (!this.content) errors.content = { message: "Content is required" }
            return Object.keys(errors).length ? { errors } : undefined
        }
        static create =  jest.fn()
        static find = jest.fn()
        static findByIdAndUpdate = jest.fn()
        static findByIdAndDelete = jest.fn()
    }
    return { Note }
})

describe("Note validation tests", () => {
    it("Missing Title", () => {
        const note = new Note({ 
            content: "Sample content without title" 
        });
        const err = note.validateSync();
        expect(err?.errors.title).toBeDefined()
    })
    it("Both title and content exist", () => {
        const note = new Note({ 
            title: "Sample title", 
            content: "Sample content" 
        });
        const err = note.validateSync();
        expect(err).toBeUndefined()
    })
})

describe("Error handling tests", () => {
    it("Default status code and message", () => {
        //No need for actual request, just to mock, using empty object, and typecasting
        const req = {} as Request
        //Mocking the default res through jest.fn()
        //In express, res.status() returns res, so allows chaining json(). Similarly here, we chain through mockReturnThis()
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        } as Partial<Response> as Response
        const next = jest.fn() as NextFunction
        const err = new Error()
        errorHandler(err, req, res, next)
        //toBe() for comparing primitive values, and toEqual() for comparing objects/ arrays and toHaveBeenCalledWith() for checking mock function calls
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' })
    })
    it("Customized status code and message", () => {
        const req = {} as Request
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        } as Partial<Response> as Response
        const next = jest.fn() as NextFunction
        const err = {
            statusCode: 400,
            message: "Bad Request"
        } as any
        errorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message: "Bad Request"})
    })
})

describe("Note controller tests", () => {
    let req: Request
    let res: Response
    let next: NextFunction
    beforeEach(() => {
        req = { } as Request
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as Partial<Response> as Response
        next = jest.fn() as NextFunction
        //In case of multiple tests reusing same mock, previous test’s call data can pollute the next one. So that's why we clear mocks before each test
        jest.clearAllMocks()
    })
    it("CreateNote should create and return note", async() => {
        req.body = { 
            title: "Sample title", 
            content: "Sample content" 
        }
        const mockData = {
            _id: "123",
            title: "Sample title", 
            content: "Sample content" 
        };
        //If didn't mock Note.create, it would try to actually access DB which is not desired in unit tests. So rather, return a resolved promise with mockNote
        (Note.create as jest.Mock<any>).mockResolvedValue(mockData)
        await createNote(req, res, next)
        expect(Note.create).toHaveBeenCalledWith({
            title: "Sample title", 
            content: "Sample content" 
        })
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({note: mockData})
    })
    it("GetNotes should retrieve all notes", async() => {
        const mockData = [{
            _id: "123",
            title: "Sample title",
            content: "Sample content"
        }];
        (Note.find as jest.Mock<any>).mockResolvedValue(mockData)
        await getNotes(req, res, next)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ notes: mockData})
    })
    it("UpdateNote should update and return note", async() => {
        req.params = {
            id: "123"
        }
        req.body = {
            title: "Updated title"
        }
        const mockData = {
            _id: "123",
            title: "Sample title", 
            content: "Sample content" 
        };
        (Note.findByIdAndUpdate as jest.Mock<any>).mockResolvedValue({ ...mockData, ...req.body })
        await updateNote(req, res, next)
        expect(Note.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({note: { ...mockData, ...req.body }})
    })
    it("DeleteNote should delete note and return success message", async() => {
        req.params = {
            id: "123"
        };
        (Note.findByIdAndDelete as jest.Mock<any>).mockResolvedValue({})
        await deleteNote(req, res, next)
        expect(Note.findByIdAndDelete).toHaveBeenCalledWith("123")
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenLastCalledWith({ message: 'Note deleted successfully' })
    })
})