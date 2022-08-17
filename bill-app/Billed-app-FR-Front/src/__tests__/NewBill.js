/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
//Rajout import
import userEvent from '@testing-library/user-event'
import mockStore from '../__mocks__/store'
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import Router from '../app/Router'

//Elle permet de remplacer les fonctions du fichier 
//app/store par le fichier /__mock__/store pour simuler les requêtes API.
//https://jestjs.io/fr/docs/manual-mocks
//Pour simuler le constructeur mockstore
jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
            // beforeEach: pour réaliser des opérations avant chaque test (cf cours OC )
            // https://openclassrooms.com/fr/courses/7159306-testez-vos-applications-front-end-avec-javascript/7332796-realisez-vos-premiers-tests-unitaires-avec-jest
            beforeEach(() => {
                    // mock localStorage cf bills.js l 17 ou  Dashboard.js l 57
                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                        //redirige l'utilisateur vers le formulaire cf tests routes.js
                    Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
                        // Set user as Employee in localStorage
                    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
                        // Set location
                    document.body.innerHTML = `<div id="root"></div>`
                    Router()
                })
                // test unitaire complété
            test("Then there are a form to edit new bill", () => {
                    const html = NewBillUI({})
                    document.body.innerHTML = html
                        //to-do write assertion
                        //screen= cf import de testing library
                        //cf exemple ci-dessous:
                        //https://stackoverflow.com/questions/64792767/what-is-the-difference-between-getbytext-and-screen-getbytext-in-rtl
                        /*import React from 'react'
                        import { render, screen } from '@testing-library/react'
                        import '@testing-library/jest-dom/extend-expect'
                        import { App } from "./App";

                        test("render the correct context", ()=>{
                          const view = render(<App />);
                          view.getByText("Greeting");
                          screen.getByText("Greeting");
                        });
                        getByText will query inside baseElement
                        screen.getByText will query inside document.body*/
                        //Fonctions qui récupèrent les éléments du DOM créés
                    const contentTitle = screen.getAllByText('Envoyer une note de frais')
                        //toBeTruthy correspond à tout ce qu'une instruction if traite comme vrai
                        //cf https://jestjs.io/fr/docs/using-matchers
                    expect(contentTitle).toBeTruthy
                })
                // test unitaire rajouté
            test('Then mail icon in vertical layout should be highlighted', () => {
                //Fonctions qui récupèrent les éléments du DOM créés
                const icon = screen.getByTestId('icon-mail')
                expect(icon.className).toBe('active-icon')
            })
        })
        //tests unitaires rajoutés
    describe("when I upload a file with the wrong format", () => {
        test("then it should return an error message", async() => {
            document.body.innerHTML = NewBillUI({});
            // we have to mock navigation to test it
            //cf Login.js
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });
            //https://developer.mozilla.org/en-US/docs/Web/API/File/File
            const file = new File(["hello"], "hello.txt", { type: "document/txt" });
            //Fonctions qui récupèrent les éléments du DOM créés
            const inputFile = screen.getByTestId("file");
            //cf login.js
            //https://jestjs.io/fr/docs/mock-function-api  fonction simulée
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            inputFile.addEventListener("change", handleChangeFile);
            fireEvent.change(inputFile, { target: { files: [file] } });

            expect(handleChangeFile).toHaveBeenCalled();
            expect(inputFile.files[0].type).toBe("document/txt");
            /*Comme vous l’avez lu un peu plus tôt, 
            Testing Library fournit une API qui facilite 
            la sélection d’éléments sur le DOM. 
            Elle ne teste pas les résultats (c’est le rôle de Jest). 
            Elle se compose des Queries et des Events.
            Les Queries sont des fonctions qui récupèrent des nœuds sur la page. 
            Il en existe environ une vingtaine.
            cf:https://openclassrooms.com/fr/courses/7159306-testez-vos-applications-front-end-avec-javascript/7332810-realisez-vos-premiers-tests-d-integration-avec-jest-test-dom-testing-library*/
            //++++++
            //https://testing-library.com/docs/dom-testing-library/api-async/
            await waitFor(() => screen.getByTestId("file-error-message"));
            expect(screen.getByTestId("file-error-message").classList).not.toContain(
                "hidden"
            );
        });
    });
    describe("when I upload a file with the good format", () => {
        test("then input file should show the file name", async() => {
            document.body.innerHTML = NewBillUI();
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

            const file = new File(["img"], "image.png", { type: "image/png" });
            const inputFile = screen.getByTestId("file");
            //https://jestjs.io/fr/docs/mock-function-api  fonction simulée
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            inputFile.addEventListener("change", handleChangeFile);

            userEvent.upload(inputFile, file);

            expect(handleChangeFile).toHaveBeenCalled();
            expect(inputFile.files[0]).toStrictEqual(file);
            expect(inputFile.files[0].name).toBe("image.png");

            await waitFor(() => screen.getByTestId("file-error-message"));
            expect(screen.getByTestId("file-error-message").classList).toContain(
                "hidden"
            );
        });
    });
    describe("when I submit the form with empty fields", () => {
        test("then I should stay on new Bill page", () => {
            //cf routes.js
            //En gros onNavigate est une fonction mocké qui reproduit ce que fait le router
            window.onNavigate(ROUTES_PATH.NewBill);
            const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });
            //Fonctions qui récupèrent les éléments du DOM créés
            expect(screen.getByTestId("expense-name").value).toBe("");
            expect(screen.getByTestId("datepicker").value).toBe("");
            expect(screen.getByTestId("amount").value).toBe("");
            expect(screen.getByTestId("vat").value).toBe("");
            expect(screen.getByTestId("pct").value).toBe("");
            expect(screen.getByTestId("file").value).toBe("");

            const form = screen.getByTestId("form-new-bill");
            //https://jestjs.io/fr/docs/mock-function-api  fonction simulée
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            //Message d'erreur géré par le navigateur
            expect(handleSubmit).toHaveBeenCalled();
            //https://jestjs.io/fr/docs/expect#tobetruthy
            expect(form).toBeTruthy();
        });
    });
})

//test d'intégration POST
describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
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
        document.body.append(root);
        Router();
    });

    describe("when APi is working well", () => {
        test("then I should be sent on bills page with bills updated", async() => {
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorageMock,
            });

            const form = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            form.addEventListener("submit", handleSubmit);

            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();
            expect(mockStore.bills).toHaveBeenCalled();
        });

        describe("When an error occurs on API", () => {
            test("then it should display a message error", async() => {
                console.error = jest.fn();
                window.onNavigate(ROUTES_PATH.NewBill);
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        update: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });

                const newBill = new NewBill({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                });

                const form = screen.getByTestId("form-new-bill");
                const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
                form.addEventListener("submit", handleSubmit);

                fireEvent.submit(form);

                expect(handleSubmit).toHaveBeenCalled();

                await new Promise(process.nextTick);

                expect(console.error).toHaveBeenCalled();
            });
        });
    });
});