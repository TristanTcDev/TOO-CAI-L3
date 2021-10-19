'use strict';

window.onload = () => {
    const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
    ws.onmessage = function(e) { 
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
    };
    ws.onopen = function() {
        ws.send("Bonjour Java"); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function(e){
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
};