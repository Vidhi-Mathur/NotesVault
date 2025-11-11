import Home from "@/app/page"
import { NoteCards } from "@/components/NoteCards"
import { render, screen } from "@testing-library/react"

describe("HomePage integration test", () => {
    it("Renders heading and <NoteCards /> both", () => {
        render(<Home />)
        const heading = screen.getByRole("heading", { name: /my notes/i })
        expect(heading).toBeInTheDocument()
        const createButton = screen.getByRole("button", { name: /create/i })
        expect(createButton).toBeInTheDocument()
    })
    it("End-to-end correct rendering for <NoteCards />", async() => {
        jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async() => ({
                notes: [{_id: "1", title: "Sample title", content: "Sample content"}]
            })
        } as Partial<Response> as Response) 
        render(<NoteCards />)
        const titleText = await screen.findByText("Sample title")
        const contentText = await screen.findByText("Sample content")
        expect(titleText).toBeInTheDocument()
        expect(contentText).toBeInTheDocument()
    })
    it("API failure handled at global level", async() => {
        jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("failed to fetch"))
        render(<Home />)
        const errorText = await screen.findByText(/failed to/i)
        expect(errorText).toBeInTheDocument()
    })
})