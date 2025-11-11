import { NoteCards } from "@/components/NoteCards"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("NoteCards rendering test", () => {
    it("Renders create button", () => {
        render(<NoteCards />)
        const button = screen.getByRole("button", { name: /create/i })
        expect(button).toBeInTheDocument()
    })
    it("Loading message displayed when fetching", async() => {
        //mocking fetch of notes to never resolve, so that loading state is true
        jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}))
        render(<NoteCards />)
        //getByText is synchronous, so we use findByText which is async
        const loadingText = await screen.findByText(/loading/i)
        expect(loadingText).toBeInTheDocument()
    })
    it("Error message in <p> when error state is set", async() => {
        //Reject to simulate fetch error
        jest.spyOn(global, "fetch").mockRejectedValue(new Error("failed to fetch"))
        render(<NoteCards />)
        const errorText = await screen.findByText(/failed to/i)
        expect(errorText).toBeInTheDocument()
    })
    it("Message displayed when no notes exist", async() => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ notes: [] }),
        } as Partial<Response> as Response)
        render(<NoteCards />)
        const noNotesExist = await screen.findByText(/no notes exist/i)
        expect(noNotesExist).toBeInTheDocument()
    })
}) 

describe("Modal logic tests", () => {
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
    it("openModalHandler() sets mode, currentNote, and input state correctly", async() => {
        //Mock to test edit mode
        jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            }) 
        } as Partial<Response> as Response)
        render(<NoteCards />)
        //While for "create" mode, reset input state
        const createButton = screen.getByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        expect(titleInput.value).toBe("")
    })
    it("closeModalHandler() resets mode, currentNote, and input state", async() => {
        render(<NoteCards />)
        //Click create button to trigger dialog
        const createButton = await screen.findByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        //Type
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        await userEvent.type(titleInput, "Test Title")
        //Try closing
        const cancelButton = await screen.findByRole("button", { name: /cancel/i })
        await userEvent.click(cancelButton)
        const dialog = document.querySelector("dialog") as HTMLDialogElement
        //Wait till closed
        await waitFor(() => {
            expect(dialog.open).toBe(false)
        })
        //Expected to reset once reopened again
        await userEvent.click(createButton)
        const reopenedTitle = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        expect(reopenedTitle.value).toBe("")
    })
    it("Modal DOM appears only when mode is set", async() => {
        render(<NoteCards />)
        //Not existing initially
        expect(screen.queryByRole("dialog")).toBeNull()
        //Click create button to trigger dialog
        const createButton = screen.getByRole("button", { name: /create/i })
        await createButton.click()
        expect(await screen.findByText(/create note/i)).toBeInTheDocument()
    })
})

describe("Testing input and change handlers", () => {
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
    it("changeHandler() updates input state on typing", async() => {
        render(<NoteCards />)
        //Create note, open modal and mock typing
        const createButton = screen.getByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        await userEvent.type(titleInput, "Test Title")
        expect(titleInput.value).toBe("Test Title")
    })
    it("Not submitted if empty input or error state exists", async () => {
        jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ notes: [] }),
        } as Partial<Response> as Response)
        render(<NoteCards />);
        //Clear the call made by useEffect’s initial fetch
        (global.fetch as jest.Mock).mockClear()
        const createButton = screen.getByRole("button", { name: /create/i })
        await userEvent.click(createButton)
        const submitButton = screen.getByRole("button", { name: /submit/i })
        await userEvent.click(submitButton)
        const errorText = await screen.findByText(/can't be empty/i)
        expect(errorText).toBeInTheDocument()
        expect(global.fetch).not.toHaveBeenCalled()
    })
})

describe("Testing useEffect on mount", () => {
    it("Fetches notes on mount and updates notes state", async() => {
        jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            })
        }as Partial<Response> as Response) 
        render(<NoteCards />)
        const titleText = await screen.findByText("Sample title")
        expect(titleText).toBeInTheDocument()
    })
    it("Error cleared after 3 sec", async() => {
        //Use fake timers
        jest.useFakeTimers()
        //Mock rejection
        jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("failed to fetch"))
        render(<NoteCards />)
        //Error rendered on screen
        const errorText = await screen.findByText(/failed to/i)
        expect(errorText).toBeInTheDocument()
        //Advance timers by 3 sec, and check error cleared
        jest.advanceTimersByTime(3000)
        await waitFor(() => {
            expect(screen.queryByText(/failed to/i)).toBeNull()
        })
        //Reset env after fake timers
        jest.useRealTimers()
    })
})