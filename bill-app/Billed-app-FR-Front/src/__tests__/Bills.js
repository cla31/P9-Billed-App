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

//Elle permet de remplacer les fonctions du fichier 
//app/store par le fichier /__mock__/store pour simuler les requêtes API.
jest.mock("../app/store", () => mockStore);

//test sur l'interface employée de la liste des factures
describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
            test("Then bill icon in vertical layout should be highlighted", async() => {
                    //Lien vers les données mockées
                    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                    // Définit l'utilisateur comme employé dans le localStorage
                    // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
                    window.localStorage.setItem('user', JSON.stringify({
                        type: 'Employee'
                    }));
                    //Simulation d'une navigation vers une page html.
                    const root = document.createElement("div")
                    root.setAttribute("id", "root")
                    document.body.append(root);
                    //Le router injecte les pages dans le DOM
                    router();
                    //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
                    window.onNavigate(ROUTES_PATH.Bills);
                    //waitFor provient de la testing library.
                    //Attend que la fonction soit appelée
                    await waitFor(() => screen.getByTestId('icon-window')); //Screen vient de testing library, getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
                    const windowIcon = screen.getByTestId('icon-window');
                    //to-do write expect expression
                    expect(windowIcon.className).toBe("active-icon") //stockage de la valeur de retour.
                })
                //Bug1 testé ici (avec test unitaire):
            test("Then bills should be ordered from earliest to latest", () => {
                //afficher les données du fichier views/billsUI
                document.body.innerHTML = BillsUI({ data: bills })
                    //regex de format date
                const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
                const antiChrono = (a, b) => ((a < b) ? 1 : -1) //  ordre croissant
                    //toutes les dates sont triés par date
                const datesSorted = [...dates].sort(antiChrono)
                    //je m'attends a ce que les données dates soit égal aux données datesSorted(les matchers)
                expect(dates).toEqual(datesSorted)
            })
        })
        //tests unitaires rajoutés
        //Quand je clique sur l'icone en forme d'oeil
    describe('When I am on Bills Page and i click on icon Eye of bill', () => {
        //La modale avec la piece justificative apparaît
        test('Then modal with supporting documents appears', () => {
            //La modale est dans $.fn.modal ?, jest.fn() = fonction simulée
            $.fn.modal = jest.fn() // Prevent jQuery error 
                //aiguille les routes des fichiers js.
            const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }
                //Lien vers les données mockées
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                // Définit l'utilisateur comme employé dans le localStorage
                // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
                //afficher les factures triées
            const html = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
            document.body.innerHTML = html
                //Création d'un objet facture 
            const billsContainer = new Bills({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage
                })
                //Screen vient de testing library, 
                //getByTestId va faire une requête ds le DOM:
                //récupère des éléments via les attributs data-testid
            const iconEye = screen.getAllByTestId('icon-eye')[0]
                //Simulation de la fonction handleClickIconEye de l'objet billsContainer
            const handleShowModalFile = jest.fn((e) => { billsContainer.handleClickIconEye(e.target) })
                //Listener sur l'icône de l'oeil
            iconEye.addEventListener('click', handleShowModalFile)
                //Appel de userEvent pour générer l'evenement.
            userEvent.click(iconEye)
                //On s'attend à ce que handleShowModalFile, qui ouvre la modale, soit appelée
            expect(handleShowModalFile).toHaveBeenCalled()
                //On vérifie alors si on a bien le message "justificatif" qui est présent en haut de la modale
            expect(screen.getAllByText('Justificatif')).toBeTruthy()
        })
    })
    describe("When I click on button new-bill", () => {
        test("Then the modal new Bill should open", () => {
            //aiguille les routes des fichiers js.
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            //Création d'un objet facture 
            const bill = new Bills({ document, onNavigate, mockStore, localStorage: window.localStorage });
            //Simulation de la fonction handleClickNewBill de l'objet bill
            const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e));
            //getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
            const buttonNewBill = screen.getByTestId("btn-new-bill");
            //Ajout du listener sur le bouton
            buttonNewBill.addEventListener("click", handleClickNewBill);
            //Appel de userEvent pour générer l'evenement.
            userEvent.click(buttonNewBill);
            //On s'attend à ce que handleClickNewBill, qui clique sur le bouton, soit appelée
            expect(handleClickNewBill).toHaveBeenCalled();
            //On s'attend à voir le texte "Envoyer une note de frais".
            expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
            //getByTestId va faire une requête ds le DOM:récupère des éléments via l’attribut data-testid
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
    });

})

// Test d'integration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
        //récupère les factures de l'API simulée GET
        test("fetches bills from mock API GET", async() => {
            // Définit l'utilisateur comme employé dans le localStorage
            // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            //Simulation d'une navigation vers une page html.
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            //Le router injecte les pages dans le DOM
            router();
            //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
            window.onNavigate(ROUTES_PATH.Bills);
            //waitFor provient de la testing library.
            //Attend que la fonction soit appelée
            //Ici on s'attend à voir le message mes notes de frais.
            await waitFor(() =>
                expect(screen.getByText("Mes notes de frais")).toBeTruthy()
            );
        });
        describe("When an error occurs on API", () => {
            // beforeEach: pour réaliser des opérations avant chaque test 
            beforeEach(() => {
                //Permet de mettre un espion sur une fonction qui est executée par une autre fonction test.
                jest.spyOn(mockStore, "bills");
                // permet de définir une propriété d'objet (ici window) et/ou de modifier la valeur et/ou les métadonnées d'une propriété.
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                // Définit l'utilisateur comme employé dans le localStorage
                // JSON.stringify = Renvoie une chaîne de caractère qui est du json.
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                        email: "a@a",
                    })
                );
                //Simulation d'une navigation vers une page html.
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.appendChild(root);
                //Le router injecte les pages dans le DOM
                router();
            });
            //récupère les factures de l'API et echoue avec un message 404
            test("fetches bills from an API and fails with 404 message error", async() => {
                //mockImplementationOnce: Accepte une fonction qui sera utilisée comme une implémentation 
                //de simulation pour un appel à la fonction simulée. 
                //Peut être enchaîné de sorte que plusieurs appels de fonction produisent des résultats différents.
                //Ici on appelle la fonction list() de store.js et on simule le rejet de la promesse
                //Puis création d'un objet qui simule une erreur.
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });
                //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
                window.onNavigate(ROUTES_PATH.Bills);
                //Lorsque nous passons une fonction à process.nextTick(), 
                //nous demandons au moteur d'appeler cette fonction à la 
                //process.nextTick: fin de l'opération en cours, avant le démarrage de la prochaine boucle d'événement:
                await new Promise(process.nextTick);
                //On s'attend à voir affichée l'erreur.
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });
            //fetches messages from an API and fails with 500 message error
            test("fetches messages from an API and fails with 500 message error", async() => {
                //mockImplementationOnce: Accepte une fonction qui sera utilisée comme une implémentation 
                //de simulation pour un appel à la fonction simulée. 
                //Peut être enchaîné de sorte que plusieurs appels de fonction produisent des résultats différents.
                //Ici on appelle la fonction list() de store.js et on simule le rejet de la promesse
                //Puis création d'un objet qui simule une erreur.
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"));
                        },
                    };
                });
                //Fonction qui est dans le fichier app/Router.js, elle aiguille les routes des fichiers js.
                window.onNavigate(ROUTES_PATH.Bills);
                //process.nextTick: fin de l'opération en cours, avant le démarrage de la prochaine boucle d'événement:
                await new Promise(process.nextTick);
                //On s'attend à voir affichée l'erreur.
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});