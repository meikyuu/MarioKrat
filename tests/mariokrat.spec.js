/// <reference types="cypress" />
describe('MarioKrat must-have requirement test', () => {
    it('Homepage', () => {
        cy.visit('http://localhost:8080/')

        // for (var i = 1; i <= 10; i++) {
        //     cy.get('[data-test="Speler-Toevoegen"]').click()
        // }
        //
        cy.get('[placeholder="Speler 1"]').type('Noah')
        cy.get('[placeholder="Speler 2"]').type('Vince')
        // cy.get('[placeholder="Speler 3"]').type('Tom')
        // cy.get('[placeholder="Speler 4"]').type('Emma')
        // cy.get('[placeholder="Speler 5"]').type('Lisa')
        // cy.get('[placeholder="Speler 6"]').type('Vincent')
        // cy.get('[placeholder="Speler 7"]').type('Frederik')
        // cy.get('[placeholder="Speler 8"]').type('Olivier')
        // cy.get('[placeholder="Speler 9"]').type('Edwin')
        // cy.get('[placeholder="Speler 10"]').type('Cindy')
        // cy.get('[placeholder="Speler 11"]').type('Andrei')
        // cy.get('[placeholder="Speler 12"]').type('Sergiu')

        //Settings
        cy.get('[data-test="collapsible"]').click()
        cy.get('[placeholder="Cups per Ronde"]').clear().type('1')
        //cy.get('[placeholder="Cups per Ronde"]').should('be.visible')
    })
})