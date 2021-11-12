const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client

declare const Swal:any;
window.addEventListener('load', Main);


function Main(){
    ws.onmessage = function(e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        if(e.data.toString()==="already_exist"){
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                text: 'Un policier est deja connecté pour cette crise!',
            })
        }
    };
    ws.onopen = function() {
        ws.send("Bonjour Java"); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function(e){
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}

function btnPolicier(){
    console.log("Je suis un policier");
    ws.send("policier");
}

function btnPompier(){
    console.log("Je suis un pompier");
    ws.send("pompier");
}