const ws = new WebSocket('ws://localhost:1963/BCMS_Server/BCMS'); //WebSocket coté client
let crisis_started: boolean = false;
let policier_car_ok = false;
let all_police_car_arrived = false;
let nbTruck: number;
let leftdis: number = 10;
let checkarrive: number = 0;

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
            //document.getElementsByClassName("btnall")[0].remove();
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => {ws.close()}).then(() => {window.close();})
        }

        /*
        * Appeler lorsque la crise démarre
         */
        if(dataObject.state==="crisis_started"){
            crisis_started = true;
            Swal.close();
        }
        /*
        * Appeler lorsque les policiers ont proposé une route pour les pompiers, permet au pompier de valider ou non la route
         */
        if (dataObject.status==="valid_routeP") {
            Swal.fire({
                title: 'Les pompiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Confirmer la route',
                denyButtonText: `Refuser la route`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Route confirmée !', '', 'success')
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
        /*
        * Appeler lorsque les policiers ont proposé une route pour eux même permet au pompier de valider ou non la route
         */
        if (dataObject.status==="valid_route") {
            Swal.fire({
                title: 'Les policiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Confirmer la route',
                denyButtonText: `Refuser la route`,
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire('Route confirmée !', '', 'success')
                    ws.send(JSON.stringify( {
                        function: "agree_route_policier",
                        data: dataObject.route
                    }));
                } else if (result.isDenied) {
                    Swal.fire('Route non confirmée', '', 'error')
                    ws.send(JSON.stringify({
                        function: "disagree_route_policier",
                        data: dataObject.route
                    }));
                }
            })
            return 0;
        }
        /*
        * Permet l'appel de la fonction générant le nombre de bouton nécessaire
         */
        if (dataObject.status === "route_policier_choisis") {
            for (let i = 0; i <= nbTruck; i++) {
                buttonNbPompier(i);
            }
        }
        /*
        *  Appeler lorsque les policiers ont validé leur nombre de véhicules
        *  */
        if(dataObject.status==="policier_car_ok"){
            Swal.close();
            policier_car_ok = true;
        }

        /*
        * Vérifie si tout les véhicules de police sont arrivé
         */
        if(dataObject.status==="all_police_car_arrived"){
            Swal.close();
            all_police_car_arrived = true;
        }
    };
    ws.onopen = function() {
        ws.send(JSON.stringify({message: "Bonjour Java"})); //Envoi de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function(e){
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On récupère le code d'extinction du serveur
    };
}

/*
* Représenter par le bouton "Pompier" central
* Ce bouton permet au policier, lorsqu'il est presser, de se connecter au FSC
* Si les policiers ne sont pas encore connecté ça les met en attente
* */

function btnPompier(){
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

/*
* Représenter par le bouton "Nombre de véhicule des pompiers"
* Ce bouton permet de selectionner le nombre de véhicule à envoyer
 */


function idlePompier() {
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de camions',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputAttributes:{
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbCamions) => {
        nbTruck = nbCamions.value - 1;
        toggle_button("idlePomp", nbCamions.value + "  véhicule disponible")
        ws.send(JSON.stringify({
            function: "state_truck",
            data: nbCamions.value
        }));
        if(!policier_car_ok){
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'envoie des véhicule des Policiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            }).then(() => {
                ws.send(JSON.stringify({
                    function: "pompier_truck_request",
                }));
                document.getElementById("updcrise").textContent = "Crise pris en compte";
                document.getElementById("CriseBCMS").style.backgroundColor = "#FF8C00";
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Les policiers ont envoyé le véhicule',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
            })
        }
        else {
            document.getElementById("updcrise").textContent = "Crise pris en compte";
            document.getElementById("CriseBCMS").style.backgroundColor = "#FF8C00";
        }
    })
}

/*
* Cette fonction permet la création des différents button dispatched et arrivé
 */

function buttonNbPompier(e) {
        let x = document.createElement("button");
        x.id = ("button_dispatched" + e);
        x.className = "button_dispatched";
        document.body.appendChild(x);
        document.getElementById(x.id).onclick = function() {dispaffi(x.id)};
        let myButton = <HTMLInputElement>document.getElementById(x.id);
        myButton.textContent = "Dispatcher #" + e;
        myButton.style.alignItems = "center";
        myButton.style.color = "white";
        myButton.style.fontWeight= "bold";
        myButton.style.top = "55%";
        myButton.style.left = leftdis + "%";
        myButton.style.width = "5%";
        myButton.style.height = "4%";
        myButton.style.position = "absolute";
        myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
        myButton.style.border = "1";
        myButton.style.borderRadius = "8px";
        myButton.style.boxShadow = "rgba(151, 65, 252, 0.2) 0 15px 30px -5px";
        myButton.style.boxSizing = "border-box";
        myButton.style.fontFamily = "Phantomsans, sans-serif";
        myButton.style.fontSize = "15px";
        myButton.style.justifyContent = "center";
        myButton.style.padding = "3px";
        myButton.style.cursor = "pointer";


        let y = document.createElement("button");
        y.id = ("button_arrive" + e);
        y.className = "button_arrive";
        document.body.appendChild(y);
        document.getElementById(y.id).onclick = function() {vireraffi(y.id)};
        let myButtonAri = <HTMLInputElement>document.getElementById(y.id);
        myButtonAri.style.display = "none";
        myButtonAri.textContent = "Arrivé #" + e;
        myButtonAri.style.alignItems = "center";
        myButtonAri.style.color = "white";
        myButtonAri.style.fontWeight= "bold";
        myButtonAri.style.top = "70%";
        myButtonAri.style.left = leftdis + "%";
        myButtonAri.style.width = "5%";
        myButtonAri.style.height = "4%";
        myButtonAri.style.position = "absolute";
        myButtonAri.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
        myButtonAri.style.border = "1";
        myButtonAri.style.borderRadius = "8px";
        myButtonAri.style.boxShadow = "rgba(151, 65, 252, 0.2) 0 15px 30px -5px";
        myButtonAri.style.boxSizing = "border-box";
        myButtonAri.style.fontFamily = "Phantomsans, sans-serif";
        myButtonAri.style.fontSize = "15px";
        myButtonAri.style.justifyContent = "center";
        myButtonAri.style.padding = "3px";
        myButtonAri.style.cursor = "pointer";

        leftdis += 7;

        document.getElementById("updcrise").textContent = "Crise entrain d\'être résolus";
        document.getElementById("CriseBCMS").style.backgroundColor = "#FFFF00";
}

/*
* Cette fonction est appelée lors de l'appuie sur les boutons "dispatcher  #"
* Elle permet de changer l'affichage des boutons dispatcher
*/

function dispaffi(id: string) {
    let a = id.slice(-1);
    toggle_button(id, "Vehicule Dispatcher");
    let myButton = <HTMLInputElement>document.getElementById("button_arrive" + a);
    myButton.style.display = "block";
    toggle_buttonPom("button_arrive" + a, "Arrivé #" + a);
    ws.send(JSON.stringify({
        function: "dispatch_truck_fireman",
        data: a,
    }));
}

/*
* Cette fonction est appelée lors de l'appuie sur les boutons "arrivé  #"
* Elle permet de changer l'affichage des boutons arrivé
*/

function vireraffi(id: string) {
    toggle_button(id, "Vehicule arrivé");
    checkarrive += 1;
    ws.send(JSON.stringify({
        function: "arrived_truck_fireman",
        data: id.slice(-1),
    }));
    if (checkarrive > nbTruck) {
        ws.send(JSON.stringify({
            function: "all_fireman_truck_arrived"
        }));
        if(!all_police_car_arrived){
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'arrivée de tous les véhicules des Policiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            }).then(() => {
                document.getElementById("updcrise").textContent = "Crise résolus";
                document.getElementById("CriseBCMS").style.backgroundColor = "#32CD32";
                document.getElementById("ShutdownServ").style.display = "block";
            });
        }
        else {
            document.getElementById("updcrise").textContent = "Crise résolus";
            document.getElementById("CriseBCMS").style.backgroundColor = "#32CD32";
            document.getElementById("ShutdownServ").style.display = "block";
        }
    }
}

/*
* Cette fonction est appelée lors de l'appuie sur les "shutdown"
* Elle permet au serveur de se fermer lors de l'appuie sur le dit bouton
*/

async function ShutdownServeur() {
    ws.send(JSON.stringify( {
        function: "shutdown"
    }));
    Swal.fire('Le serveur a été fermé, la fenetre va se fermer dans 5 secondes');
    await sleep(5000);
    window.close();
}

/*
* Fonction qui permet le changement de couleur des différents bouton
* En l'occurence elle permet de les griser et les rendre non cliquable
 */

function toggle_button ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}

/*
* Fonction qui permet le changement de couleur des différents bouton
* En l'occurence elle permet de les rendre rouge et cliquable
 */

function toggle_buttonPom ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButton.textContent = texte;
}

/*
* Fonction permettant de faire une pause durant une durée souhaiter
*/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

