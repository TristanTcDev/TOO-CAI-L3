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
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => { ws.close(); });
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
    document.getElementById("Pompier").remove();
    let myButton = document.getElementById("Policier");
    myButton.style.position = "absolute";
    myButton.style.left = "50%";
    myButton.style.transform = "translateX(-50%)";
    ws.send(JSON.stringify({
        id: "policier",
    }));
}
function btnPompier() {
    console.log("Je suis un pompier");
    document.getElementById("Policier").remove();
    let myButton = document.getElementById("Pompier");
    myButton.style.position = "absolute";
    myButton.style.left = "50%";
    //document.getElementById("myDIV").innerHTML = "How are you?";
    document.getElementById("idlePomp").style.display = "block";
    document.getElementById("Pompier").style.left = "40%";
    ws.send(JSON.stringify({
        id: "pompier",
    }));
}
function idlePompier() {
    console.log("le test a fonctionner LET'S GOOOOOOOOOO");
    ws.send("idlePompier");
}
//# sourceMappingURL=index.js.map