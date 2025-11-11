import RootLayout from "@/app/layout"
import Home from "@/app/page"
import { render, screen } from "@testing-library/react"

describe("Navbar integration tests", () => {
    it("<Navbar /> rendered correct over top of layout", () => {
        render(
        <RootLayout>
            <Home />
        </RootLayout>
        )
    //The navbar should exist and appear before page content
    const navbar = screen.getByRole("navigation")
    expect(navbar).toBeInTheDocument()
    })
    it("<Navbar /> img and <HomePage /> appear simultaneously", () => {
        render(
        <RootLayout>
            <Home />
        </RootLayout>
        )
        const logo = screen.getByRole("img", { name: /logo/i })
        expect(logo).toBeInTheDocument()
        const heading = screen.getByRole("heading", { name: /my notes/i })
        expect(heading).toBeInTheDocument()
    })
    it("<Navbar /> remains mounted throughout routing", () => {
        const { rerender } = render(
            <RootLayout>
                <Home />
            </RootLayout>
        )
        const logoBefore = screen.getByRole("img", { name: /logo/i })
        expect(logoBefore).toBeInTheDocument()
        //Simulate page change by rerendering different child
        rerender(
            <RootLayout>
                <main>
                    <h1>Different Page</h1>
                </main>
            </RootLayout>
        )
        const logoAfter = screen.getByRole("img", { name: /logo/i })
        expect(logoAfter).toBeInTheDocument()
        const newHeading = screen.getByRole("heading", { name: /different page/i })
        expect(newHeading).toBeInTheDocument()
    })
    it("<Navbar /> + layout snapshot test", () => {
        const { asFragment } = render(
        <RootLayout>
            <Home />
        </RootLayout>
        )
        expect(asFragment()).toMatchSnapshot()
    })
})