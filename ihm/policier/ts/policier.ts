const ws = new WebSocket('ws://localhost:1963/BCMS_Server/BCMS'); //WebSocket coté client
let leftdis: number = 10;
let crisis_started: boolean = false;
let route_policeman = false;
let fireman_truck_ok = false;
let all_fireman_truck_arrived = false;
let checkpomp: boolean = false;
let checkpol: boolean = false;
let pc: string = "Route des Policiers";
let pp: string = "Route des Pompiers";
let nbCar: number;
let checkarrive: number = 0;
let myArrayOfThings = [
    {id: 1, name: 'Route 1'},
    {id: 2, name: 'Route 2'},
    {id: 3, name: 'Route 3'}
];
let myArrayOfThingsP = [
    {id: 1, name: 'Route 1'},
    {id: 2, name: 'Route 2'},
    {id: 3, name: 'Route 3'}
];
declare const Swal:any;


window.addEventListener('load', Main);
window.onload=function(){
    document.getElementById("idlePoli").style.display="none";
    document.getElementById("routePoli").style.display="none";
    document.getElementById("routePomp").style.display="none";
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
                allowOutsideClick: 'false',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => {ws.close()}).then(() => {window.close();})
        }
        if(dataObject.state==="crisis_started"){
            crisis_started = true;
            Swal.close();
        }
        if(dataObject.status==="disagree_route"){
            console.log(dataObject.route);
            if ( myArrayOfThings.length > 1) {
                console.log(myArrayOfThings.length);
                let array = []
                myArrayOfThings.map(route =>{
                    if(route.id != Number.parseInt(dataObject.route)){
                        array.push(route);
                    }
                });
                myArrayOfThings = array;
                console.log(myArrayOfThings.length);
                console.log(myArrayOfThings);
                routePolicier();
            }
            else {
                if (checkpomp === false) {
                    toggle_buttonPom("routePomp", pp);
                }
                toggle_button("routePoli", "Route par défaut pour les policiers");
                pc = "Route par défaut pour les policiers"
                Swal.fire({
                    icon: 'warning',
                    title: 'Problème de Route',
                    text: 'Plus aucune route n\'est disponble, une par défaut a été sélectionnée !'
                })
                ws.send(JSON.stringify({
                    function: "route_poli_choisis",
                }));
                    for (let i = 0; i <= nbCar; i++) {
                        buttonNbPoliciers(i);
                    }
            }
        }
        if(dataObject.status==="disagree_routeP"){
            console.log(dataObject.route);
            if ( myArrayOfThingsP.length > 1) {
                console.log(myArrayOfThingsP.length);
                let array = []
                myArrayOfThingsP.map(route =>{
                    if(route.id != Number.parseInt(dataObject.route)){
                        array.push(route);
                    }
                });
                myArrayOfThingsP = array;
                console.log(myArrayOfThingsP.length);
                console.log(myArrayOfThingsP);
                routePompier();
            }
            else {
                if (checkpol === false) {
                    toggle_buttonPol("routePoli", pc);
                }
                toggle_button("routePomp", "Route par défaut pour les pompiers");
                pp = "Route par défaut pour les pompiers"
                Swal.fire({
                    icon: 'warning',
                    title: 'Problème de Route',
                    text: 'Plus aucune route n\'est disponble, une par défaut a été sélectionnée !'
                })
                document.getElementById("routePoli").style.display = "block";
            }
        }

        if(dataObject.status==="agree_route"){
            if (checkpomp === false) {
                toggle_buttonPom("routePomp", pp);
            }
            if (dataObject.route === "1") {
                toggle_button("routePoli", "La " + dataObject.route + "ere route a été choisi par les policiers");
                pc = "La " + dataObject.route + "ere route a été choisi par les policiers"
            }
            else {
                toggle_button("routePoli", "La " + dataObject.route + "eme route a été choisi par les policiers");
                pc = "La " + dataObject.route + "eme route a été choisi par les policiers"
            }
            Swal.fire(
                'Route validée !',
                'La route a été validée !',
                'success'
            )
            ws.send(JSON.stringify({
                function: "route_poli_choisis",
            }));
                for (let i = 0; i <= nbCar; i++) {
                    console.log(i);
                    buttonNbPoliciers(i);
                }
        }

        if(dataObject.status==="agree_routeP"){
            if (checkpol === false) {
                toggle_buttonPol("routePoli", pc);
            }
            if (dataObject.route === "1") {
                toggle_button("routePomp", "La " + dataObject.route + "ere route a été choisi par les pompiers");
                pp = "La " + dataObject.route + "ere route a été choisi par les pompiers"
            }
            else {
                toggle_button("routePomp", "La " + dataObject.route + "eme route a été choisi par les pompiers");
                pp = "La " + dataObject.route + "eme route a été choisi par les pompiers"
            }
            Swal.fire(
                'Route validé!',
                'La route a été validée pompier!',
                'success'
            )
            document.getElementById("routePoli").style.display = "block";
        }

        if(dataObject.status==="fireman_truck_ok"){
            Swal.close();
            fireman_truck_ok = true;
        }
        if(dataObject.status==="all_fireman_truck_arrived"){
            Swal.close();
            all_fireman_truck_arrived = true;
        }

    };
    ws.onopen = function() {
        ws.send(JSON.stringify({message: "Bonjour Java"})); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = async function(e){
        Swal.fire('Le serveur a été fermé, la fenètre va se fermer dans 5 secondes');
        await sleep(5000);
        window.close();
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}

function btnPolicier(){
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
            Swal.showLoading()
        },
    }).then(() => {
        toggle_button("policier", "Policier");
        document.getElementById("idlePoli").style.display = "block";
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
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
    })
}

function idlePolicier() {
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de voiture',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputAttributes:{
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbVoitures) => {
        nbCar = nbVoitures.value - 1;
        toggle_button("idlePoli", nbVoitures.value + "  véhicule disponible");
        console.log(nbVoitures.value);
        ws.send(JSON.stringify({
            function: "state_car",
            data: nbVoitures.value
        }));
        if(!fireman_truck_ok){
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'envoie des véhicule des Pompiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            }).then(() => {
                ws.send(JSON.stringify({
                    function: "police_car_request",
                }));
                document.getElementById("updcrise").textContent = "Crise pris en compte";
                document.getElementById("CriseBCMS").style.backgroundColor = "#FF8C00";
                document.getElementById("routePomp").style.display = "block";
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Les pompiers ont envoyé le véhicule',
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
            document.getElementById("routePomp").style.display = "block";
        }
    })
}

function buttonNbPoliciers(e) {
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
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(15,26,102,1) 15%, rgba(15,26,102,1) 85%, rgba(0,0,0,1) 100%)";
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
    myButtonAri.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(15,26,102,1) 15%, rgba(15,26,102,1) 85%, rgba(0,0,0,1) 100%)";
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

function dispaffi(id: string) {
    let a = id.slice(-1);
    toggle_button(id, "Vehicule Dispatcher");
    let myButton = <HTMLInputElement>document.getElementById("button_arrive" + a);
    myButton.style.display = "block";
    toggle_buttonPol("button_arrive" + a, "Arrivé #" + a);
    ws.send(JSON.stringify({
        function: "dispatch_car_police",
        data: a,
    }));
}

function vireraffi(id: string) {
    toggle_button(id, "Vehicule arrivé");
    console.log(id);
    checkarrive += 1;
    console.log(checkarrive);
    ws.send(JSON.stringify({
        function: "arrived_car_police",
        data: id.slice(-1),
    }));
    if (checkarrive > nbCar) {
        ws.send(JSON.stringify({
            function: "all_police_car_arrived"
        }));
        if(!all_fireman_truck_arrived){
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'arrivée de tous les véhicules des Pompiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            }).then(() => {
                document.getElementById("updcrise").textContent = "Crise résolus";
                document.getElementById("CriseBCMS").style.backgroundColor = "#32CD32";
            });
        }
        else {
            document.getElementById("updcrise").textContent = "Crise résolus";
            document.getElementById("CriseBCMS").style.backgroundColor = "#32CD32";
        }
    }
}


function routePolicier() {
        let options = {};
        myArrayOfThings.map((o)=> {options[o.id] = o.name});
        Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputOptions: options,
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.'
            }
        }
        }).then((routePoli) => {
            checkpol = true;
            toggle_button("routePomp", pp)
            toggle_button("routePoli", pc)
            console.log ("route policier fonctionne");
            ws.send(JSON.stringify({
                function: "routePolicier",
                data: routePoli.value
            }));
        });

}

function routePompier() {
    let options = {};
    myArrayOfThingsP.map((o)=> {options[o.id] = o.name});
    Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputOptions: options,
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.'
            }
        }
    }).then((routePomp) => {
        checkpomp = true;
        toggle_button("routePomp", pp)
        toggle_button("routePoli", pc)
        console.log ("route pompier fonctionne");
        ws.send(JSON.stringify({
            function: "routePompier",
            data: routePomp.value
        }));
    });
}

function toggle_button ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}

function toggle_buttonPom ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButton.textContent = texte;
}

function toggle_buttonPol ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(15,26,102,1) 15%, rgba(15,26,102,1) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
