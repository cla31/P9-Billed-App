/**
 * @jest-environment jsdom
 */

//Test sur le tableau de bord et sur le fonctionnement de GET

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)

describe('Given I am connected as an Admin', () => {
        //je suis sur le tableau de bord, il y a des factures et il y en a une en attente
        describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
                //les factures filtrées par statut en attente devraient renvoyer une facture
                test('Then, filteredBills by pending status should return 1 bill', () => {
                    const filtered_bills = filteredBills(bills, "pending")
                    expect(filtered_bills.length).toBe(1)
                })
            })
            //je suis sur le tableau de bord, il y a des factures et il y en a une en acceptée
        describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
                //les factures filtrées par statut acceptée devraient renvoyer une facture
                test('Then, filteredBills by accepted status should return 1 bill', () => {
                    const filtered_bills = filteredBills(bills, "accepted")
                    expect(filtered_bills.length).toBe(1)
                })
            })
            //je suis sur le tableau de bord, il y a des factures et il y en a deux refusée
        describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
                //les factures filtrées par statut refusée devraient renvoyer deux factures
                test('Then, filteredBills by accepted status should return 2 bills', () => {
                    const filtered_bills = filteredBills(bills, "refused")
                    expect(filtered_bills.length).toBe(2)
                })
            })
            //je suis sur le tableau de bord mais en cours de chargement
        describe('When I am on Dashboard page but it is loading', () => {
                //devrait mettre la page demandée au chargement
                test('Then, Loading page should be rendered', () => {
                    document.body.innerHTML = DashboardUI({ loading: true })
                    expect(screen.getAllByText('Loading...')).toBeTruthy()
                })
            })
            //je suis sur le tableau de bord mais le back end envoie un message d'erreur
        describe('When I am on Dashboard page but back-end send an error message', () => {
                //devrait mettre la page d'erreur
                test('Then, Error page should be rendered', () => {
                    //fais apparaitre un message d'erreur
                    document.body.innerHTML = DashboardUI({ error: 'some error message' })
                    expect(screen.getAllByText('Erreur')).toBeTruthy()
                })
            })
            //je suis sur le tableau de bord et je clique sur une flèche
        describe('When I am on Dashboard page and I click on arrow', () => {
                //la liste des factures devrait se dérouler et les cartes devraient apparaitre (FAUX, elles apparaissent si on clique dans la liste)
                test('Then, tickets list should be unfolding, and cards should appear', async() => {

                    const onNavigate = (pathname) => {
                        document.body.innerHTML = ROUTES({ pathname })
                    }

                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Admin'
                    }))

                    const dashboard = new Dashboard({
                        document,
                        onNavigate,
                        store: null,
                        bills: bills,
                        localStorage: window.localStorage
                    })
                    document.body.innerHTML = DashboardUI({ data: { bills } })

                    const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
                    const handleShowTickets2 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 2))
                    const handleShowTickets3 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 3))

                    const icon1 = screen.getByTestId('arrow-icon1')
                    const icon2 = screen.getByTestId('arrow-icon2')
                    const icon3 = screen.getByTestId('arrow-icon3')

                    icon1.addEventListener('click', handleShowTickets1)
                    userEvent.click(icon1)
                    expect(handleShowTickets1).toHaveBeenCalled()
                    await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`))
                    expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
                    icon2.addEventListener('click', handleShowTickets2)
                    userEvent.click(icon2)
                    expect(handleShowTickets2).toHaveBeenCalled()
                    await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`))
                    expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy()

                    icon3.addEventListener('click', handleShowTickets3)
                    userEvent.click(icon3)
                    expect(handleShowTickets3).toHaveBeenCalled()
                    await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`))
                    expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy()
                })
            })
            //je suis sur le tableau de bord et je click sur une des cartes correspondant à la facture
        describe('When I am on Dashboard page and I click on edit icon of a card', () => {
                //le bon formulaire doit apparaitre
                test('Then, right form should be filled', () => {

                    const onNavigate = (pathname) => {
                        document.body.innerHTML = ROUTES({ pathname })
                    }

                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Admin'
                    }))

                    const dashboard = new Dashboard({
                        document,
                        onNavigate,
                        store: null,
                        bills: bills,
                        localStorage: window.localStorage
                    })
                    document.body.innerHTML = DashboardUI({ data: { bills } })
                    const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
                    const icon1 = screen.getByTestId('arrow-icon1')
                    icon1.addEventListener('click', handleShowTickets1)
                    userEvent.click(icon1)
                    expect(handleShowTickets1).toHaveBeenCalled()
                    expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
                    const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
                    userEvent.click(iconEdit)
                    expect(screen.getByTestId(`dashboard-form`)).toBeTruthy()
                })
            })
            //je suis sur le tableau de bord et je clique 2 fois sur la facture(dans ce cas, 
            //le détail de la facture apparait et disparait, du fait que cela referme la facture) 
        describe('When I am on Dashboard page and I click 2 times on edit icon of a card', () => {
            test('Then, big bill Icon should Appear', () => {

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Admin'
                }))

                const dashboard = new Dashboard({
                    document,
                    onNavigate,
                    store: null,
                    bills: bills,
                    localStorage: window.localStorage
                })
                document.body.innerHTML = DashboardUI({ data: { bills } })

                const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
                const icon1 = screen.getByTestId('arrow-icon1')
                icon1.addEventListener('click', handleShowTickets1)
                userEvent.click(icon1)
                expect(handleShowTickets1).toHaveBeenCalled()
                expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
                const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
                userEvent.click(iconEdit)
                userEvent.click(iconEdit)
                const bigBilledIcon = screen.queryByTestId("big-billed-icon")
                expect(bigBilledIcon).toBeTruthy()
            })
        })

        //je suis sur le tableau de bord et il n'y a pas de facture
        describe('When I am on Dashboard and there are no bills', () => {
            //Aucune facture ne peut être montré
            test('Then, no cards should be shown', () => {
                document.body.innerHTML = cards([])
                const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
                expect(iconEdit).toBeNull()
            })
        })
    })
    //je suis connectée en tant qu'admin, et je suis sur la page du tableau de bord. je click sur un facture en attente
describe('Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill', () => {
        //quand je clique sur le bouton acceptée
        describe('When I click on accept button', () => {
                //je suis renvoyé vers le tableau de bord avec une grande icône à la place du formulaire
                test('I should be sent on Dashboard with big billed icon instead of form', () => {
                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Admin'
                    }))
                    document.body.innerHTML = DashboardFormUI(bills[0])

                    const onNavigate = (pathname) => {
                        document.body.innerHTML = ROUTES({ pathname })
                    }
                    const store = null
                    const dashboard = new Dashboard({
                        document,
                        onNavigate,
                        store,
                        bills,
                        localStorage: window.localStorage
                    })

                    const acceptButton = screen.getByTestId("btn-accept-bill-d")
                    const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]))
                    acceptButton.addEventListener("click", handleAcceptSubmit)
                    fireEvent.click(acceptButton)
                    expect(handleAcceptSubmit).toHaveBeenCalled()
                    const bigBilledIcon = screen.queryByTestId("big-billed-icon")
                    expect(bigBilledIcon).toBeTruthy()
                })
            })
            //quand je clique sur le bouton refusée
        describe('When I click on refuse button', () => {
            //je suis renvoyé vers le tableau de bord avec une grande icône à la place du formulaire
            test('I should be sent on Dashboard with big billed icon instead of form', () => {
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Admin'
                }))
                document.body.innerHTML = DashboardFormUI(bills[0])

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }
                const store = null
                const dashboard = new Dashboard({
                    document,
                    onNavigate,
                    store,
                    bills,
                    localStorage: window.localStorage
                })
                const refuseButton = screen.getByTestId("btn-refuse-bill-d")
                const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]))
                refuseButton.addEventListener("click", handleRefuseSubmit)
                fireEvent.click(refuseButton)
                expect(handleRefuseSubmit).toHaveBeenCalled()
                const bigBilledIcon = screen.queryByTestId("big-billed-icon")
                expect(bigBilledIcon).toBeTruthy()
            })
        })
    })
    //je suis connecté en tant qu'admin, je suis sur le tableau de bord et j'ai cliqué sur une facture
describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
    //quand je clique sur l'icone oeil
    describe('When I click on the icon eye', () => {
        //une modal devrait s'ouvrir
        test('A modal should open', () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Admin'
            }))
            document.body.innerHTML = DashboardFormUI(bills[0])
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const store = null
            const dashboard = new Dashboard({
                document,
                onNavigate,
                store,
                bills,
                localStorage: window.localStorage
            })

            const handleClickIconEye = jest.fn(dashboard.handleClickIconEye)
            const eye = screen.getByTestId('icon-eye-d')
            eye.addEventListener('click', handleClickIconEye)
            userEvent.click(eye)
            expect(handleClickIconEye).toHaveBeenCalled()

            const modale = screen.getByTestId('modaleFileAdmin')
            expect(modale).toBeTruthy()
        })
    })
})

// test d'intégration GET
//je suis un utilisateur connecté en tant qu'admin
describe("Given I am a user connected as Admin", () => {
    //lorsque je navige dans le tableau de bord
    describe("When I navigate to Dashboard", () => {
        //devrait récupérer les factures de l'api du mock
        test("fetches bills from mock API GET", async() => {
                localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.append(root)
                router()
                window.onNavigate(ROUTES_PATH.Dashboard)
                await waitFor(() => screen.getByText("Validations"))
                const contentPending = await screen.getByText("En attente (1)")
                expect(contentPending).toBeTruthy()
                const contentRefused = await screen.getByText("Refusé (2)")
                expect(contentRefused).toBeTruthy()
                expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
            })
            //Lorsqu'il y a une erreur sur l'API
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                    jest.spyOn(mockStore, "bills")
                    Object.defineProperty(
                        window,
                        'localStorage', { value: localStorageMock }
                    )
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Admin',
                        email: "a@a"
                    }))
                    const root = document.createElement("div")
                    root.setAttribute("id", "root")
                    document.body.appendChild(root)
                    router()
                })
                //je récupère les factures de l'api mais cela échoue et j'ai une erreur 404
            test("fetches bills from an API and fails with 404 message error", async() => {

                    mockStore.bills.mockImplementationOnce(() => {
                        return {
                            list: () => {
                                return Promise.reject(new Error("Erreur 404"))
                            }
                        }
                    })
                    window.onNavigate(ROUTES_PATH.Dashboard)
                    await new Promise(process.nextTick);
                    const message = await screen.getByText(/Erreur 404/)
                    expect(message).toBeTruthy()
                })
                //je récupère un message d'erreur 500 par l'api
            test("fetches messages from an API and fails with 500 message error", async() => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })

                window.onNavigate(ROUTES_PATH.Dashboard)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })

    })
})