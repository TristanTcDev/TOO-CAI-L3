const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
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
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => { ws.close(); }).then(() => { window.close(); });
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
    let myButton = document.getElementById("policier");
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = "Policier";
    document.getElementById("idlePoli").style.display = "block";
    document.getElementById("routePoli").style.display = "block";
    ws.send(JSON.stringify({
        id: "policier",
    }));
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
    Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        inputOptions: {
            'Route 1': '1',
            'Route 2': '2',
            'Route 3': '3'
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.';
            }
        }
    }).then((routePoli) => {
        console.log(routePoli.value);
        ws.send(JSON.stringify({
            function: "state_car",
            data: routePoli.value
        }));
    });
    /*if (road) {
        Swal.fire({ html: `Vous avez choisis la route: ${road}` })
    }*/
    console.log("route policier fonctionne");
    ws.send("routePolicier");
}
//# sourceMappingURL=policier.js.map