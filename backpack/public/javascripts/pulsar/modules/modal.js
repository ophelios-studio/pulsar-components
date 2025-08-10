export default class Modal {

    #modalId;
    #modalElement;
    #modalForms;
    #modalError;
    #options;

    constructor(modalId, options = {}) {
        this.#modalId = modalId;
        this.#options = options;
        this.#modalElement = document.getElementById(modalId);
        this.#modalForms = this.#modalElement.querySelectorAll("form");
        this.#modalError = this.#modalElement.querySelector(".zf-modal-error");
        if (!this.#modalElement) {
            console.error("Modal root element matching id [" + modalId + "] not found in document.");
        }
    }

    // TODO: Call only when the modal is opened ...
    initialize() {
        if (this.#modalForms[0] !== undefined && this.#modalForms[0].getElementsByTagName("select").length === 0) {
            this.#autoFocus();
        }
        this.#initializeForms();
        this.#initializeCustomMessageEvent();
        if (this.#inDebug()) {
            console.log("Modal id [" + this.#modalId + "] has been initiated.");
        }
    }

    #inDebug() {
        return this.#options.debug || false;
    }

    #initializeCustomMessageEvent() {
        this.#modalElement.addEventListener('show.bs.modal', (event) => {
            if (this.#modalError) {
                this.#hideErrors();
            }

            for (let formElement of this.#modalForms) {
                formElement.reset();
            }

            // Removes everything identified with class .zf-modal-reset
            this.#modalElement.querySelectorAll(".zf-modal-reset").forEach(function (el)  {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });

            const target = event.relatedTarget;
            const message = target.getAttribute('data-zf-modal-title');
            const submitUrl = target.getAttribute('data-zf-modal-submit');
            const bindTableName = target.getAttribute('data-zf-modal-bind-to');
            if (message) {
                let eventMessageElement = this.#modalElement.querySelector(".zf-event-title");
                if (eventMessageElement) {
                    eventMessageElement.innerHTML = message;
                    if (this.#inDebug()) {
                        console.log("Loading custom message for modal id [" + this.#modalId + "].");
                    }
                } else {
                    console.error("Custom message cannot be applied. There needs to be a .data-zf-modal-message element present in the modal.");
                }
            }
            if (submitUrl) {
                for (let formElement of this.#modalForms) {
                    formElement.action = submitUrl;
                    if (this.#inDebug()) {
                        console.log("Loading custom submit URL for modal id [" + this.#modalId + "].");
                    }
                }
            }
            if (bindTableName) {
                const tableElement = document.querySelector("[data-zf-bind-as]");
                if (!tableElement) {
                    console.error("HTML table element with data-zf-bind-as [" + bindTableName + "] not found in document.")
                }
                let rowChecks = tableElement.querySelectorAll('th[scope="row"] input[type="checkbox"]:checked');
                for (let formElement of this.#modalForms) {
                    let temporaryHiddenDiv = document.createElement("div");
                    temporaryHiddenDiv.className = "zf-modal-reset";
                    for (let rowCheck of rowChecks) {
                        let hidden = document.createElement("input");
                        hidden.type = 'hidden';
                        hidden.name = "ids";
                        hidden.value = rowCheck.value;
                        temporaryHiddenDiv.appendChild(hidden);
                    }
                    formElement.appendChild(temporaryHiddenDiv);
                }
            }
        });
    }

    #autoFocus() {
        const firstInput = this.#modalElement.querySelector('input:not([type="hidden"])');
        if (firstInput) {
            this.#modalElement.addEventListener('shown.bs.modal', () => {
                firstInput.focus();
            });
            if (this.#inDebug()) {
                console.log("Modal focus initiated for the first input.");
            }
        }
    }

    #initializeForms() {
        for (let formElement of this.#modalForms) {
            if (this.#inDebug()) {
                console.log("Modal form initiated.");
            }
            formElement.addEventListener('submit', (event) => {
                event.preventDefault();
                this.#hideErrors();
                let formData = new FormData(formElement);
                formData.append("CSRF_KEEP_ALIVE", "alive");

                let object = {};
                for (let [key, value] of formData.entries()) {
                    key = key.replace(/\[\]$/, ''); // Removes trailing '[]' from key
                    if (object[key] === undefined) {
                        object[key] = [value]; // Always store as array
                    } else {
                        object[key].push(value);
                    }
                }

                // Flatten arrays with only one item
                for (let key in object) {
                    object[key] = object[key].length === 1 ? object[key][0] : object[key];
                }

                let json = JSON.stringify(object);

                if (this.#inDebug()) {
                    console.log("DATA TO SEND: ")
                    console.log(json);
                }

                fetch(formElement.action, {
                    method: formElement.method,
                    headers: {
                        "Content-Type": "application/json",
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: json
                }).then(response => {
                    if (this.#inDebug()) {
                        console.log("Raw response ...");
                        console.log(response);
                    }
                    response.clone().json().then(data => {
                        if (this.#inDebug()) {
                            console.log("Raw JSON response ...");
                            console.log(data);
                        }
                        this.#defaultOnResponse(data, formElement);
                    }).catch(error => {
                        console.error("Cannot parse the response as JSON.");
                        console.error(error);
                        console.log(response.text().then(data => {
                            console.log("Raw TEXT response ...");
                            console.log(data);
                        }));
                        this.#modalError.innerHTML = "An error happened while submitting the form.";
                        this.#showErrors(formElement);
                    });
                }).catch(error => {
                    console.error("Cannot receive the response.");
                    console.error(error);
                    this.#modalError.innerHTML = "An error happened while submitting the form.";
                    this.#showErrors(formElement);
                });
            });
        }
    }

    /**
     * Default behavior for modal response reception which consists of closing the modal on success and refreshing the
     * referrer page or redirect to the specified page (redirect property of response object). In case of error, the
     * modal stays open and display the message(s) in a specified error container (.zf-modal-error).
     *
     * @param data
     * @param formElement
     */
    #defaultOnResponse(data, formElement) {
        if (data.status === "success") {
            new bootstrap.Modal('#' + this.#modalId).hide();
            setTimeout(() => {
                if (!data.redirect) {
                    location.reload();
                } else {
                    location.replace(data.redirect);
                }
            }, 400);
        } else if (data.status === "error") {
            if (this.#modalError) {
                if (data.errors.length === 1) {
                    this.#modalError.innerHTML = data.errors[0];
                } else {
                    let html = "<ul>";
                    for (const error of data.errors) {
                        html += "<li>" + error + "</li>";
                    }
                    html += "</ul>";
                    this.#modalError.innerHTML = html;
                }
                this.#showErrors(formElement);
            } else {
                console.error("Modal does not contain an error section. Be sure to include a .zf-modal-error div for potential error display.");
            }
        }
    }

    #showErrors(formElement) {
        if (!this.#modalError) {
            console.error("Modal does not contain an error section. Be sure to include a .zf-modal-error div for potential error display.");
            return;
        }
        this.#modalError.classList.add("d-block");
        const submitButtons = formElement.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            const previousValue = button.getAttribute("data-zf-temporary");
            if (previousValue) {
                button.innerHTML = previousValue;
                button.disabled = false;
                button.removeAttribute("data-zf-temporary");
                formElement.removeAttribute("data-zf-submitting");
            }
        });
    }

    #hideErrors() {
        if (!this.#modalError) {
            console.error("Modal does not contain an error section. Be sure to include a .zf-modal-error div for potential error display.");
            return;
        }
        this.#modalError.classList.remove("d-block");
    }
}
