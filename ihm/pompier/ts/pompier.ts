const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
let crisis_started: boolean = false;

declare const Swal:any;


window.addEventListener('load', Main);
window.onload=function(){
    document.getElementById("idlePomp").style.display="none";
    document.getElementById("routePomp").style.display="none";
    document.getElementById("accorderCrisePomp").style.display="none";
    document.getElementById("accorderCrisePolPomp").style.display="none";
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
                } else if (result.isDenied) {
                    Swal.fire('Route non confirmer', '', 'info')
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
        let myButton = <HTMLInputElement>document.getElementById("pompier");
        myButton.disabled = true;
        myButton.style.cursor = "not-allowed";
        myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
        myButton.textContent = "Pompier";
        document.getElementById("idlePomp").style.display = "block";
        document.getElementById("routePomp").style.display = "block";
        document.getElementById("accorderCrisePomp").style.display = "block";
        document.getElementById("accorderCrisePolPomp").style.display = "block";
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

function routePompier() {
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
                return 'Choisissez une route.'
            }
        }
    }).then((routePomp) => {
        console.log(routePomp.value);
        ws.send(JSON.stringify({
            function: "state_car",
            data: routePomp.value
        }));
    });
}

function accorderCrisePompier() {
    console.log ("Route accordé pour les policiers");
    ws.send("accorderCrisePompier");
}

function accorderCrisePolPompier() {
    console.log ("Route accordé pour les pompiers");
    ws.send("accorderCrisePolPompier");
}
