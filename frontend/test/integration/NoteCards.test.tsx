import { NoteCards } from "@/components/NoteCards"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("Testing submit and deletion logic", () => {
    beforeAll(() => {
        if(typeof HTMLDialogElement !== "undefined"){
            HTMLDialogElement.prototype.showModal = jest.fn(function(){
                this.open = true
            })
            HTMLDialogElement.prototype.close = jest.fn(function(){
                this.open = false
            })
        }
    })
    it("submitHandler() with mode=create sends POST request and updates notes state", async() => {
        const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            })
        } as Partial<Response> as Response) 
        render(<NoteCards />)
        //Not existing initially
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click create button to trigger dialog
        const createButton = screen.getByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        await userEvent.type(titleInput, "Test Title")
        const contentInput = screen.getByPlaceholderText(/content/i) as HTMLInputElement
        await userEvent.type(contentInput, "Test Content")
        //Submit
        const submitButton = await screen.findByRole("button", { name: /submit/i })
        await userEvent.click(submitButton)
        //Check if fetch called twice, (one for getting all notes, and second for POST request, and has given info too)
        expect(fetchSpy).toHaveBeenCalledTimes(2)
        expect(fetchSpy).toHaveBeenNthCalledWith(2, "http://localhost:5000/",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Test Title", content: "Test Content" })
            })
        )
    })
    it("submitHandler() with mode=edit sends PATCH request and updates notes state", async() => {
        const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            })
        } as Partial<Response> as Response) 
        render(<NoteCards />)        
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click edit button to trigger dialog
        const editButton = await screen.findByRole("button", { name: /edit/i })
        await userEvent.click(editButton)
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        await userEvent.type(titleInput, "Updated Title")
        //Submit
        const updateButton = await screen.findByRole("button", { name: /update/i })
        await userEvent.click(updateButton)
        //Check if fetch called twice, (one for getting all notes, and second for POST request, and has given info too)
        const patchCalls = fetchSpy.mock.calls.filter(([url]) => String(url).includes("update/1"))
        expect(patchCalls.length).toBeGreaterThanOrEqual(1)
        expect(patchCalls[0][1]).toEqual(
            expect.objectContaining({
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: "Sample titleUpdated Title", 
                content: "Sample content"
              }),
            })
        )
    })
    it("deleteHandler() sends DELETE request and updates notes state", async() => {
        const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            })
        } as Partial<Response> as Response) 
        render(<NoteCards />)        
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click edit button to trigger dialog
        const deleteButton = await screen.findByRole("button", { name: /delete/i })
        await userEvent.click(deleteButton)
        //Confirm
        const allDeleteButtons = await screen.findAllByRole("button", { name: /^delete$/i })
        const confirmDelete = allDeleteButtons.find((btn) => btn.textContent === "Delete")!
        await userEvent.click(confirmDelete)
        const deleteCalls = fetchSpy.mock.calls.filter(([url]) => String(url).includes("delete/1"))
        expect(deleteCalls.length).toBeGreaterThanOrEqual(1)
    })
    it("submitHandler() handles errors gracefully", async() => {
        const fetchSpy = jest.spyOn(global, "fetch")
        //Fetching notes on mount
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            notes: [{ _id: "1", title: "Sample title", content: "Sample content" }],
          }),
        } as Partial<Response> as Response)
        //Simulate failure on submit
        fetchSpy.mockRejectedValueOnce(new Error("failed to submit"))
        render(<NoteCards />)
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click create button to trigger dialog
        const createButton = screen.getByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        await userEvent.type(titleInput, "Test Title")
        const contentInput = screen.getByPlaceholderText(/content/i) as HTMLInputElement
        await userEvent.type(contentInput, "Test Content")
        //Submit
        const submitButton = await screen.findByRole("button", { name: /submit/i })
        await userEvent.click(submitButton)
        const errorText = await screen.findByText(/failed to/i)
        expect(errorText).toBeInTheDocument()
    })
    it("deleteHandler() handlers errors gracefully", async() => {
        const fetchSpy = jest.spyOn(global, "fetch")
        //Fetching notes on mount
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            notes: [{ _id: "1", title: "Sample title", content: "Sample content" }],
          }),
        } as Partial<Response> as Response)
        //Simulate failure on deletion
        fetchSpy.mockRejectedValueOnce(new Error("failed to delete"))
        render(<NoteCards />)
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click edit button to trigger dialog
        const deleteButton = await screen.findByRole("button", { name: /delete/i })
        await userEvent.click(deleteButton)
        //Confirm
        const allDeleteButtons = await screen.findAllByRole("button", { name: /^delete$/i })
        const confirmDelete = allDeleteButtons.find((btn) => btn.textContent === "Delete")!
        await userEvent.click(confirmDelete)
        const errorText = await screen.findByText(/failed to/i)
        expect(errorText).toBeInTheDocument()
    })
})
