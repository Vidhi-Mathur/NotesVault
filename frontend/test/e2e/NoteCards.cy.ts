describe("Notecards e2e test", () => {
    it("New note successfully created", () => {
        cy.visit("/")
        cy.contains("No notes exist...create one!").should("be.visible")
        cy.request("POST", `${Cypress.env("apiUrl")}/`, {
            title: "Sample Title",
            content: "Same Content"
        })
        //Need to reload as notes fetched initially through useEffect once when page mounted, no re-run
        cy.reload()
        cy.contains("Sample Title").should("be.visible")
    })
    it("Successfully edits existing note", () => {
        cy.visit("/")
        //Log thorugh cy.task("log", response) as configured
        //Need to use chaining, not async await as they're not promises, internally uses a custom internal scheduler, command queue, automatic retries, implicit waiting and time-traveling snapshots
        cy.request("POST", `${Cypress.env("apiUrl")}/`, {
            title: "Sample Title",
            content: "Same Content"
        }).then((response) => {
            const id = response.body.note._id
            cy.request("PATCH", `${Cypress.env("apiUrl")}/update/${id}`, {
                title: "Sample Title Updated",
                content: "Same Content"
            }).then(() => {
                cy.reload()
                cy.contains("Sample Title Updated").should("exist");
            })  
        })
    })
    it("Successfully deletes existing note", () => {
        cy.visit("/")
        cy.request("POST", `${Cypress.env("apiUrl")}/`, {
            title: "Sample Title",
            content: "Same Content"
        }).then((response) => {
            const id = response.body.note._id
            cy.request("DELETE", `${Cypress.env("apiUrl")}/delete/${id}`).then(() => {
                cy.reload()
                cy.contains("Sample Title").should("not.exist")
            })  
        })
    })
    it("Opens and closes note modal", () => {
        cy.visit("/");
        cy.get("dialog").should("not.be.visible");
        cy.contains("Create").click();
        cy.get("dialog").should("be.visible");
        cy.contains(/create note/i).should("be.visible");
        cy.contains("Cancel").click();
        cy.get("dialog").should("not.be.visible");
    })
})