import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals"
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from "supertest"
import { app } from "../app"
import mongoose from "mongoose";
import { Note } from "../models/note-model";

//Spinning up an in-memory MongoDB per test suite to isolate tests and have a clean env after each run.
let mongoServer: MongoMemoryServer

describe("Note controller tests", () => {
    beforeAll(async() => {
        mongoServer = await MongoMemoryServer.create()
        const url = mongoServer.getUri()
        await mongoose.connect(url)
    })
    afterAll(async() => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })
    beforeEach(async() => {
        await Note.deleteMany({})
    })
    it("POST /create", async() => {
        const res = await request(app).post('/create').send({
            title: "Sample Title",
            content: "Sample Content"
        })
        expect(res.status).toBe(201)
        expect(res.body.note).toHaveProperty("_id")
    }),
    it("GET /", async() => {
        await Note.create({ title: 'Sample Title 1', content: 'Sample Content 1' });
        await Note.create({ title: 'Sample Title 2', content: 'Sample Content 2' });
        const res = await request(app).get('/')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.notes)).toBe(true)
        expect(res.body.notes.length).toBe(2)
    }),
    it("PATCH /update/:id", async() => {
        const note = await Note.create({ title: 'Old Sample Title', content: 'Old Sample Content' });
        const res = await request(app).patch(`/update/${note._id}`).send({
            title: "Updated Sample Title",
            content: "Updated Sample Content"
        })
        expect(res.status).toBe(200)
        expect(res.body.note.title).toBe("Updated Sample Title")
    }),
    it("DELETE /delete/:id", async() => {
        const note = await Note.create({ title: 'Sample Title', content: 'Sample Content' });
        const res = await request(app).delete(`/delete/${note._id}`)
        expect(res.status).toBe(200)
        expect(res.body.message).toBe("Note deleted successfully")
        const deleted = await Note.findById(note._id)
        expect(deleted).toBeNull()
    })
})