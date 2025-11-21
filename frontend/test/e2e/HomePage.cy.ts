describe("Homepage e2e test", () => {
    it("Fetches notes from backend as <Home /> loads", () => {
        //Send data first, as useEffect runs first
        cy.request("POST", `${Cypress.env("apiUrl")}/`, {
            title: "Sample Title",
            content: "Sample Content"
        })
        //Visit homepage
        cy.visit("/")
        //Contains heading, title and content
        cy.contains("My Notes").should("be.visible")
        cy.contains("Sample Title").should("be.visible")
        cy.contains("Sample Content").should("be.visible")
    })
    it("Error displayed if failed to fetch notes", () => {
        //Mocking error
        cy.intercept("GET", `${Cypress.env("apiUrl")}/`, {
            forceNetworkError: true
        })
        cy.visit("/")
        cy.contains(/failed to fetch/i).should("be.visible")
    })
})