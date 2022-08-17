import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
    constructor({ document, onNavigate, store, localStorage }) {
        this.document = document
        this.onNavigate = onNavigate
        this.store = store
        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener("submit", this.handleSubmit)
        const file = this.document.querySelector(`input[data-testid="file"]`)
        file.addEventListener("change", this.handleChangeFile)
        this.fileUrl = null
        this.fileName = null
        this.billId = null
        new Logout({ document, localStorage, onNavigate })
    }
    handleChangeFile = e => {
        e.preventDefault()
        const errorMessage = this.document.querySelector(".error-message");
        const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
        console.log("file", file);
        const filePath = e.target.value.split(/\\/g);
        const fileName = filePath[filePath.length - 1];
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email;
        formData.append('file', file);
        formData.append('email', email);
        //Bug 3 à corriger ici
        // empêcher la saisie d'un document 
        // qui a une extension différente de jpg, 
        // jpeg ou png au niveau du formulaire du 
        // fichier NewBill.js. Indice : 
        // cela se passe dans la méthode handleChangeFile...

        // Si le fichier a l'extension jpeg, jpg, png, on affiche sinon erreur si le fichier n'est pas au bon format.
        if (
            (file && file.type === "image/jpeg") ||
            file.type === "image/jpg" ||
            file.type === "image/png"
        ) {
            console.log("Le fichier est au bon format")
            this.store
                .bills()
                .create({
                    data: formData,
                    headers: {
                        noContentType: true
                    }
                })
                .then(({ fileUrl, key }) => {
                    console.log(fileUrl)
                    this.billId = key
                    this.fileUrl = fileUrl
                    this.fileName = fileName
                }).catch(error => console.error(error))
        } else {
            console.log("Le fichier n'est pas au bon format")
            e.target.value = "";
            errorMessage.classList.remove("hidden");
        }
    }
    handleSubmit = e => {
        e.preventDefault()
        console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
        const email = JSON.parse(localStorage.getItem("user")).email
        const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
            name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
            amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
            date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
            commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: 'pending'
        }
        this.updateBill(bill)
        this.onNavigate(ROUTES_PATH['Bills'])
    }

    // not need to cover this function by tests
    /* istanbul ignore next */
    updateBill = (bill) => {
        if (this.store) {
            this.store
                .bills()
                .update({ data: JSON.stringify(bill), selector: this.billId })
                .then(() => {
                    this.onNavigate(ROUTES_PATH['Bills'])
                })
                .catch(error => console.error(error))
        }
    }
}