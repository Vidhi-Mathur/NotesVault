import { defineConfig } from "cypress"

module.exports = defineConfig({
  e2e: {
    specPattern: "test/e2e/**/*.cy.{js,jsx,ts,tsx}",
    //Frontend
    baseUrl: "http://localhost:3000",  
    //Backend    
    env: {
      apiUrl: "http://localhost:5000"    
    },
    supportFile: false,
    setupNodeEvents(on, config) {
        on("task", {
            log(message){
                console.log(message)
                return null
            }
        })
    },
  },
});
