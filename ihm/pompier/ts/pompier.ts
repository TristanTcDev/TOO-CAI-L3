const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
let crisis_started: boolean = false;

declare const Swal:any;


window.addEventListener('load', Main);
window.onload=function(){
    document.getElementById("idlePomp").style.display="none";
    document.getElementById("accorderCrisePomp").style.display="none";
    document.getElementById("accorderCrisePolPomp").style.display="none";
    document.getElementById("ShutdownServ").style.display="none";
}

function Main(){
    ws.onmessage = function(e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        let data: string = e.data.toString();
        let dataObject = JSON.parse(data);
        if(dataObject.error==="already_exist") {
            console.log("plus de place disponible ");
            //document.getElementsByClassName("btnall")[0].remove();
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => {ws.close()}).then(() => {window.close();})
        }
        if(dataObject.state==="crisis_started"){
            crisis_started = true;
            Swal.close();
        }
        if (dataObject.status==="valid_routeP") {
            Swal.fire({
                title: 'Les pompiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Route confirmer',
                denyButtonText: `Route non confirmer`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Route confirmer!', '', 'success')
                    ws.send(JSON.stringify( {
                        function: "agree_route_pompier",
                        data: dataObject.route
                    }));
                } else if (result.isDenied) {
                    Swal.fire('Route non confirmer', '', 'error')
                    ws.send(JSON.stringify({
                        function: "disagree_route_pompier",
                        data: dataObject.route
                    }));
                }
            })
            return 0;
        }
        if (dataObject.status==="valid_route") {
            Swal.fire({
                title: 'Les policiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Route confirmer',
                denyButtonText: `Route non confirmer`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Route confirmer!', '', 'success')
                    ws.send(JSON.stringify( {
                        function: "agree_route_policier",
                        data: dataObject.route
                    }));
                } else if (result.isDenied) {
                    Swal.fire('Route non confirmer', '', 'error')
                    ws.send(JSON.stringify({
                        function: "disagree_route_policier",
                        data: dataObject.route
                    }));
                }
            })
            return 0;
        }
    };
    ws.onopen = function() {
        ws.send(JSON.stringify({message: "Bonjour Java"})); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function(e){
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}

function btnPompier(){
    console.log("Je suis un pompier");
    ws.send(JSON.stringify({
        id: "pompier",
    }));
    Swal.fire({
        title: 'En attente',
        html: 'Attente de la connexion du policier',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading()
        },
    }).then(() => {
        toggle_button("pompier", "Pompier");
        document.getElementById("idlePomp").style.display = "block";
        document.getElementById("ShutdownServ").style.display = "block";
        /*document.getElementById("accorderCrisePomp").style.display = "block";
        document.getElementById("accorderCrisePolPomp").style.display = "block";*/
        ws.send(JSON.stringify({
            function: "pompier_connexion_request",
        }));
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Connecté à la crise',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    })
}


function idlePompier() {
    console.log("idle pompier fonctionne");
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de camions',
        inputAttributes:{
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
    })
}

async function ShutdownServeur() {
    console.log("Shutdown marche");
    ws.send(JSON.stringify( {
        function: "shutdown"
    }));
    Swal.fire('Le serveur a était fermer, la fenetre va être fermer dans 5 secondes');
    await sleep(5000);
    window.close();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*function accorderCrisePompier() {
    console.log ("Route accordé pour les policiers");
    ws.send("accorderCrisePompier");
}

function accorderCrisePolPompier() {
    console.log ("Route accordé pour les pompiers");
    ws.send("accorderCrisePolPompier");
}*/

function toggle_button ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}