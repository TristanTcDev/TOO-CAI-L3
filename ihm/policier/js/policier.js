const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
let crisis_started = false;
let myArrayOfThings = [
    { id: 1, name: 'Route 1' },
    { id: 2, name: 'Route 2' },
    { id: 3, name: 'Route 3' }
];
window.addEventListener('load', Main);
window.onload = function () {
    document.getElementById("idlePoli").style.display = "none";
    document.getElementById("routePoli").style.display = "none";
};
function Main() {
    ws.onmessage = function (e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        let data = e.data.toString();
        let dataObject = JSON.parse(data);
        if (dataObject.error === "already_exist") {
            console.log("plus de place disponible ");
            //document.getElementsByClassName("btnall")[0].remove();
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                allowOutsideClick: 'false',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => { ws.close(); }).then(() => { window.close(); });
        }
        if (dataObject.state === "crisis_started") {
            crisis_started = true;
            Swal.close();
        }
        if (dataObject.status === "disagree_route") {
            console.log(dataObject.route);
            if (myArrayOfThings.length > 1) {
                console.log(myArrayOfThings.length);
                myArrayOfThings.splice(Number.parseInt(dataObject.route) - 1, 1);
                console.log(myArrayOfThings.length);
                routePolicier();
            }
            else {
                Swal.fire({
                    icon: 'important',
                    title: 'Problème de Route',
                    text: 'Plus aucune route n\'est disponble, une par défaut a était sélectionner !'
                });
            }
        }
    };
    ws.onopen = function () {
        ws.send(JSON.stringify({ message: "Bonjour Java" })); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function (e) {
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}
function btnPolicier() {
    console.log("Je suis un policier");
    ws.send(JSON.stringify({
        id: "policier",
    }));
    Swal.fire({
        title: 'En attente',
        html: 'Attente de la connexion du pompier',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    }).then(() => {
        toggle_button("policier", "Policier");
        document.getElementById("idlePoli").style.display = "block";
        document.getElementById("routePoli").style.display = "block";
        ws.send(JSON.stringify({
            function: "police_connexion_request",
        }));
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Connecté à la crise',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    });
}
function idlePolicier() {
    console.log("idle Policier fonctionne");
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de voiture',
        inputAttributes: {
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbVoitures) => {
        console.log(nbVoitures.value);
        ws.send(JSON.stringify({
            function: "state_car",
            data: nbVoitures.value
        }));
    });
}
function routePolicier() {
    let options = {};
    myArrayOfThings.map((o) => { options[o.id] = o.name; });
    Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputOptions: options,
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.';
            }
        }
    }).then((routePoli) => {
        toggle_button("routePoli", "Route des Policiers");
        console.log("route policier fonctionne");
        ws.send(JSON.stringify({
            function: "routePolicier",
            data: routePoli.value
        }));
    });
}
function toggle_button(id, texte) {
    let myButton = document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}
//# sourceMappingURL=policier.js.map