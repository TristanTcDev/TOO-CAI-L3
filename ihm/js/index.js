const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
window.addEventListener('load', Main);
window.onload = function () {
    document.getElementById("idlePomp").style.display = "none";
};
function Main() {
    ws.onmessage = function (e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        let data = e.data.toString();
        let dataObject = JSON.parse(data);
        if (dataObject.error === "already_exist") {
            console.log("plus de place disponible ");
            document.getElementsByClassName("idlePomp")[0].remove();
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
    document.getElementById("pompier").remove();
    let myButton = document.getElementById("policier");
    myButton.style.position = "absolute";
    myButton.style.left = "50%";
    myButton.style.transform = "translateX(-50%)";
    ws.send(JSON.stringify({
        id: "policier",
    }));
}
function btnPompier() {
    console.log("Je suis un pompier");
    document.getElementById("policier").remove();
    let myButton = document.getElementById("pompier");
    myButton.style.position = "absolute";
    myButton.style.left = "50%";
    //document.getElementById("myDIV").innerHTML = "How are you?";
    document.getElementById("pompier").style.left = "40%";
    document.getElementById("idlePomp").style.display = "block";
    ws.send(JSON.stringify({
        id: "pompier",
    }));
}
function idlePompier() {
    console.log("le test a fonctionner LET'S GOOOOOOOOOO");
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de camions',
        inputAttributes: {
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbCamions) => {
        console.log(nbCamions.value);
        ws.send(JSON.stringify({
            function: "state_truck",
            data: nbCamions.value
        }));
    });
}
//# sourceMappingURL=index.js.map