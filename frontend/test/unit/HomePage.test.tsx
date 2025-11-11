import Home from "@/app/page"
import { NoteCards } from "@/components/NoteCards"
import { render, screen } from "@testing-library/react"

describe('Homepage unit test', () => {
    it("Renders <main> and heading correctly", () => {
        render(<Home />)
        const mainElement = document.querySelector("main")
        expect(mainElement).toBeInTheDocument()
        const heading = screen.getByRole("heading", { name: /my notes/i })
        expect(heading).toBeInTheDocument()
    })
    it("Renders NoteCards component", () => {
        render(<NoteCards />)
        const createButton = screen.getByRole("button", { name: /create/i })
        expect(createButton).toBeInTheDocument()
    })
    it("Snapshot test", () => {
        const { asFragment } = render(<Home />)
        expect(asFragment()).toMatchSnapshot()
    })
})
