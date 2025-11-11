import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/Navbar';

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={props.alt} {...props} />;
    }
}))

describe("Navbar unit component", () => {
    it("Renders <img /> with correct src and alt attributes", () => {
        render(<Navbar />)
        const logo = screen.getByRole("img", { name: /logo/i })
        expect(logo).toBeInTheDocument()
        expect(logo).toHaveAttribute("src", "/logo.png")
        expect(logo).toHaveAttribute("alt", "logo")
    })
    it("Renders Navbar with correct class names", () => {
        render(<Navbar />)
        const NavBar = screen.getByRole("navigation")
        //Important for custom classes
        expect(NavBar).toHaveClass("fixed", "top-0", "left-0", "bg-black")
    })
    //Capturing the rendered output of <Navbar /> once, store it, and automatically compare future renders against it to detect unintended visual or structural regressions.
    it("Snapshot test", () => {
        const { asFragment } = render(<Navbar />)
        expect(asFragment()).toMatchSnapshot()
    })
})