/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
            test("Then bill icon in vertical layout should be highlighted", async() => {

                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Employee'
                    }))
                    const root = document.createElement("div")
                    root.setAttribute("id", "root")
                    document.body.append(root)
                    router()
                    window.onNavigate(ROUTES_PATH.Bills)
                    await waitFor(() => screen.getByTestId('icon-window'))
                    const windowIcon = screen.getByTestId('icon-window')
                        //to-do write expect expression
                    expect(windowIcon.className).toBe("active-icon")
                })
                //Bug1 testé ici (avec test unitaire):
            test("Then bills should be ordered from earliest to latest", () => {
                document.body.innerHTML = BillsUI({ data: bills })
                const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
                const antiChrono = (a, b) => ((a < b) ? 1 : -1)
                const datesSorted = [...dates].sort(antiChrono)
                expect(dates).toEqual(datesSorted)
            })
        })
        //tests unitaires rajoutés
    describe('When I am on Bills Page and i click on icon Eye of bill', () => {
        test('Then modal with supporting documents appears', () => {
            $.fn.modal = jest.fn() // Prevent jQuery error
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

            const html = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
            document.body.innerHTML = html

            const billsContainer = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage
            })

            const iconEye = screen.getAllByTestId('icon-eye')[0]
            const handleShowModalFile = jest.fn((e) => { billsContainer.handleClickIconEye(e.target) })

            iconEye.addEventListener('click', handleShowModalFile)
            userEvent.click(iconEye)

            expect(handleShowModalFile).toHaveBeenCalled()
            expect(screen.getAllByText('Justificatif')).toBeTruthy()
        })
    })
    describe("When I click on button new-bill", () => {
        test("Then the modal new Bill should open", () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const bill = new Bills({ document, onNavigate, mockStore, localStorage: window.localStorage });

            const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e));
            const buttonNewBill = screen.getByTestId("btn-new-bill");
            buttonNewBill.addEventListener("click", handleClickNewBill);
            userEvent.click(buttonNewBill);
            expect(handleClickNewBill).toHaveBeenCalled();
            expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
    });

})

// Test d'integration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
        test("fetches bills from mock API GET", async() => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() =>
                expect(screen.getByText("Mes notes de frais")).toBeTruthy()
            );
        });
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills");
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                        email: "a@a",
                    })
                );
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.appendChild(root);
                router();
            });
            test("fetches bills from an API and fails with 404 message error", async() => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });

            test("fetches messages from an API and fails with 500 message error", async() => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"));
                        },
                    };
                });

                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});