// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//import * as creds from '../fixtures/creds'
import * as elements from '../core/pageObjects/elements'
import 'cypress-file-upload';
import '@4tw/cypress-drag-drop'
//import * as labels from '../core/pageObjects/labels'

const logoutButton = '.navbar-nav path'

const login = (email, password) => {
    cy.get(elements.loginElements.emailInp)
        .should('be.visible')
        .clear()
        .type(email)
    cy.get(elements.loginElements.submitButton)
        .should('be.visible')
        .click()
    // wait for second screen
    cy.get(elements.loginElements.emailInp)
        .should('be.visible')
        .clear()
        .type(email)
    cy.get(elements.loginElements.passwordInp)
        .should('be.visible')
        .clear()
        .type(password)
    cy.get(elements.loginElements.initSubmitButton)
        .should('be.visible')
        .click()
}

const conditionalLoginForAdmin = (url, email, password) => {
    cy.visit(url);
    cy.get(elements.generalElements.loginButton)
        .should('be.visible')
        .click()
    cy.get('body')
        .wait(15000)
        .then(($body) => {
            if ($body.find(logoutButton).length > 0) {
                cy.get(elements.homeElements.logoutButton)
                    .click()
                    .then(() => {
                        cy.get(elements.generalElements.loginButton)
                            .should('be.visible')
                            .click()
                        login(email, password)
                    })
            } else {
                login(email, password)
            }
        })
}

const conditionalLoginForInvestor = (url, email, password) => {
    cy.visit(url);
    cy.get(elements.generalElements.loginButton)
        .should('be.visible')
        .click()
    cy.get('body')
        .wait(15000)
        .then(($body) => {
            if ($body.find('div.dropdown button').length > 0) {
                cy.get(elements.investorHomeElements.navbarDropdown)
                    .click()
                cy.get(elements.investorHomeElements.signOutLink)
                    .click()
                    .then(() => {
                        cy.get(elements.generalElements.loginButton)
                            .should('be.visible')
                            .click()
                        login(email, password)
                    })
            } else {
                login(email, password)
            }
        })
}
const conditionalLoginForMarketPlaceInvestor = (url, email, password) => {
    cy.visit(url);
    cy.get('body')
        .wait(5000)
        .then(($body) => {
            if ($body.find('[data-testid="ExpandMoreIcon"]').length > 0) {
                cy.get('[data-testid="ExpandMoreIcon"]')
                    .click()
                cy.get('.css-1nfvqhf')
                    .click()
                    .then(() => {
                        cy.get('.css-5bhwjx')
                            .should('be.visible')
                            .click()
                        login(email, password)
                    })
            } else {
                cy.get('.css-5bhwjx')
                    .should('be.visible')
                    .click()
                login(email, password)
            }
        })
}

const loginHelper = (url, email, password) => {
    cy.visit(url);
    cy.get(elements.generalElements.loginButton)
        .should('be.visible')
        .click()
    cy.get(elements.loginElements.emailInp)
        .should('be.visible')
        .clear()
        .type(email)

    // wait for second screen
    cy.get(elements.loginElements.emailInp)
        .should('be.visible')
        .clear()
        .type(email)
    cy.get(elements.loginElements.passwordInp)
        .should('be.visible')
        .clear()
        .type(password)
    cy.get(elements.loginElements.initSubmitButton)
        .should('be.visible')
        .click()
}


Cypress.Commands.add('DirectadminLogin', (email, password) => {
    loginHelper(Cypress.env('devAdminUrl'), email, password)
})

Cypress.Commands.add('DirectinvestorLogin', (email, password) => {
    loginHelper(Cypress.env('devInvestorUrl'), email, password)
})
Cypress.Commands.add('adminLogin', (email, password) => {
    conditionalLoginForAdmin(Cypress.env('devAdminUrl'), email, password)
})

Cypress.Commands.add('investorLogin', (email, password) => {
    conditionalLoginForInvestor(Cypress.env('devInvestorUrl'), email, password)
})
Cypress.Commands.add('marketplaceLogin', (email, password) => {
    conditionalLoginForMarketPlaceInvestor(Cypress.env('marketplaceUrl'), email, password)
})