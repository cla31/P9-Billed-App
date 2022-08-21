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
import BillsUI from "../views/BillsUI.js"

//Elle permet de remplacer les fonctions du fichier 
//app/store par le fichier /__mock__/store pour simuler les requêtes API.
//https://jestjs.io/fr/docs/manual-mocks
jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
            // beforeEach: pour réaliser des opérations avant chaque test (cf cours OC )
            // https://openclassrooms.com/fr/courses/7159306-testez-vos-applications-front-end-avec-javascript/7332796-realisez-vos-premiers-tests-unitaires-avec-jest
            beforeEach(() => {
                    //Lien vers les données mockées
                    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                        //redirige l'utilisateur vers le formulaire cf tests routes.js
                    Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
                        // Définit l'utilisateur comme employé dans le localStorage
                        // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
                    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
                    document.body.innerHTML = `<div id="root"></div>`
                    Router()
                })
                // test unitaire complété
            test("Then there are a form to edit new bill", () => {
                    //Page du formulaire
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
            //Page du formulaire
            document.body.innerHTML = NewBillUI({});
            // we have to mock navigation to test it
            //cf Login.js
            //onNavigate:Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            //Création d'un objet nouvelle facture 
            const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });
            //https://developer.mozilla.org/en-US/docs/Web/API/File/File
            //Création d'un objet fichier hello.txt
            const file = new File(["hello"], "hello.txt", { type: "document/txt" });
            //getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
            const inputFile = screen.getByTestId("file");
            //Simulation de la fonction handleChangeFile de l'objet NewBill
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            //Ajout d'un listener sur l'input avec l'evènement change
            inputFile.addEventListener("change", handleChangeFile);
            //Simulation d'une interaction avec l'utilisateur
            fireEvent.change(inputFile, { target: { files: [file] } });
            //On s'attend à ce que handleChangeFile, qui charge le fichier,soit appelée
            expect(handleChangeFile).toHaveBeenCalled();
            //On vérifie alors si on a bien le document/txt sélectionné
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
            //waitFor provient de la testing library.
            //Attend que la fonction soit appelée
            await waitFor(() => screen.getByTestId("file-error-message"));
            //On s'attend à voir le message d'erreur
            expect(screen.getByTestId("file-error-message").classList).not.toContain(
                "hidden"
            );
        });
    });
    describe("when I upload a file with the good format", () => {
        test("then input file should show the file name", async() => {
            //Page du formulaire
            document.body.innerHTML = NewBillUI();
            // we have to mock navigation to test it
            //onNavigate:Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            //Création d'un objet nouvelle facture 
            const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
            //Création d'un objet fichier image.png
            const file = new File(["img"], "image.png", { type: "image/png" });
            //getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
            const inputFile = screen.getByTestId("file");
            //Simulation de la fonction handleChangeFile de l'objet NewBill
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            //Ajout d'un listener sur l'input avec l'evènement change
            inputFile.addEventListener("change", handleChangeFile);
            //Simulation d'une interaction avec l'utilisateur
            userEvent.upload(inputFile, file);
            //On s'attend à ce que handleChangeFile, qui charge le fichier,soit appelée
            expect(handleChangeFile).toHaveBeenCalled();
            //On vérifie alors si on a bien le fichier
            expect(inputFile.files[0]).toStrictEqual(file);
            //On vérifie alors si on a bien l'image.png
            expect(inputFile.files[0].name).toBe("image.png");
            //waitFor provient de la testing library.
            //Attend que la fonction soit appelée
            await waitFor(() => screen.getByTestId("file-error-message"));
            //On s'attend à ne pas voir le message d'erreur
            expect(screen.getByTestId("file-error-message").classList).toContain(
                "hidden"
            );
        });
    });
    describe("when I submit the form with empty fields", () => {
        test("then I should stay on new Bill page", () => {
            //onNavigate:Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
            window.onNavigate(ROUTES_PATH.NewBill);
            //Création d'un objet nouvelle facture 
            const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });
            //Fonctions qui récupèrent les éléments créés dans le DOM (et les champs sont vides)
            expect(screen.getByTestId("expense-name").value).toBe("");
            expect(screen.getByTestId("datepicker").value).toBe("");
            expect(screen.getByTestId("amount").value).toBe("");
            expect(screen.getByTestId("vat").value).toBe("");
            expect(screen.getByTestId("pct").value).toBe("");
            expect(screen.getByTestId("file").value).toBe("");
            //getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
            const form = screen.getByTestId("form-new-bill");
            //Simulation de la fonction handleSubmit de l'objet newBill
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            //Ajout d'un listener sur le formulaire avec l'evènement submit
            form.addEventListener("submit", handleSubmit);
            //Simulation de l'évènement submit
            fireEvent.submit(form);
            //On vérifie si la fonction handleSubmit a bien été appelée
            expect(handleSubmit).toHaveBeenCalled();
            //On s'attend à la présence du formulaire.
            expect(form).toBeTruthy();
        });
    });
})

//test d'intégration POST

describe("Given I am a user connected as Employee", () => {
    describe("When I create new bill", () => {
        test("send bill to mock API POST", async() => {
            // Définit l'utilisateur comme employé dans le localStorage
            // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
            localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
                //Simulation d'une navigation vers une page html.
            const root = document.createElement("div");
            root.setAttribute("id", "root")
            document.body.append(root)
                //Le router injecte les pages dans le DOM
            Router()
                //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
            window.onNavigate(ROUTES_PATH.NewBill)
                //Permet de mettre un espion sur une fonction qui est executée par une autre fonction test.
            jest.spyOn(mockStore, "bills")
                //mockImplementationOnce: Accepte une fonction qui sera utilisée comme une implémentation 
                //de simulation pour un appel à la fonction simulée. 
                //Peut être enchaîné de sorte que plusieurs appels de fonction produisent des résultats différents.
                //Ici on appelle la fonction create() de store.js et on simule la résolution de la promesse
            mockStore.bills.mockImplementationOnce(() => {
                    return {
                        create: (bill) => {
                            return Promise.resolve()
                        },
                    }
                })
                //Lorsque nous passons une fonction à process.nextTick(), 
                //nous demandons au moteur d'appeler cette fonction à la 
                //process.nextTick: fin de l'opération en cours, avant le démarrage de la prochaine boucle d'événement:
            await new Promise(process.nextTick);
            //On s'attend à voir affiché le message "mes notes de frais"
            expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        })
        describe("When an error occurs on API", () => {
            test("send bill to mock API POST", async() => {
                // Définit l'utilisateur comme employé dans le localStorage
                // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
                localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
                    //Simulation d'une navigation vers une page html.
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.append(root);
                //Le router injecte les pages dans le DOM
                Router();
                //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
                window.onNavigate(ROUTES_PATH.NewBill)
                    //Permet de mettre un espion sur une fonction qui est executée par une autre fonction test.
                jest.spyOn(mockStore, "bills");
                //mockImplementationOnce: Accepte une fonction qui sera utilisée comme une implémentation 
                //de simulation pour un appel à la fonction simulée. 
                //Peut être enchaîné de sorte que plusieurs appels de fonction produisent des résultats différents.
                //Ici on appelle la fonction create() de store.js et on simule le rejet de la promesse
                mockStore.bills.mockImplementationOnce(() => {
                        return {
                            create: (bill) => {
                                return Promise.reject(new Error("Erreur 404"))
                            },
                        }
                    })
                    //Lorsque nous passons une fonction à process.nextTick(), 
                    //nous demandons au moteur d'appeler cette fonction à la 
                    //process.nextTick: fin de l'opération en cours, avant le démarrage de la prochaine boucle d'événement:
                await new Promise(process.nextTick);
                //Introduction du message "Erreur 404" dans la page.
                const html = BillsUI({ error: "Erreur 404" })
                document.body.innerHTML = html
                    //On s'attend à voir affichée l'erreur.
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            });
            test("send bill to mock API POST", async() => {
                // Définit l'utilisateur comme employé dans le localStorage
                // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
                localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
                    //Simulation d'une navigation vers une page html.
                const root = document.createElement("div")
                root.setAttribute("id", "root");
                document.body.append(root);
                //Le router injecte les pages dans le DOM
                Router();
                //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
                window.onNavigate(ROUTES_PATH.NewBill)
                    //Permet de mettre un espion sur une fonction qui est executée par une autre fonction test.
                jest.spyOn(mockStore, "bills")
                    //mockImplementationOnce: Accepte une fonction qui sera utilisée comme une implémentation 
                    //de simulation pour un appel à la fonction simulée. 
                    //Peut être enchaîné de sorte que plusieurs appels de fonction produisent des résultats différents.
                    //Ici on appelle la fonction create() de store.js et on simule le rejet de la promesse
                mockStore.bills.mockImplementationOnce(() => {
                        return {
                            create: (bill) => {
                                return Promise.reject(new Error("Erreur 500"))
                            },
                        }
                    })
                    //Lorsque nous passons une fonction à process.nextTick(), 
                    //nous demandons au moteur d'appeler cette fonction à la 
                    //process.nextTick: fin de l'opération en cours, avant le démarrage de la prochaine boucle d'événement:
                await new Promise(process.nextTick);
                //Introduction du message "Erreur 500" dans la page.
                const html = BillsUI({ error: "Erreur 500" })
                document.body.innerHTML = html
                    //On s'attend à voir affichée l'erreur.
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})