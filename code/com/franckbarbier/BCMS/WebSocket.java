/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.franckbarbier.BCMS;

/**
 *
 * @author arnaud
 */
public class WebSocket {
        @javax.websocket.server.ServerEndpoint(value = "/BCMS")
        public static class My_ServerEndpoint {
            @javax.websocket.OnClose
            public void onClose(javax.websocket.Session session, javax.websocket.CloseReason close_reason) {   
                System.out.println("onClose: " + close_reason.getReasonPhrase());
            }
            @javax.websocket.OnError
            public void onError(javax.websocket.Session session, Throwable throwable) {
                System.out.println("onError: " + throwable.getMessage());
            }
            @javax.websocket.OnMessage
            public void onMessage(javax.websocket.Session session, String message) {
                System.out.println("Message de JavaScript: " + message);
            }
            @javax.websocket.OnOpen
            public void onOpen(javax.websocket.Session session, javax.websocket.EndpointConfig ec) throws java.io.IOException {
                System.out.println("OnOpen... " + ec.getUserProperties().get("Author"));
                session.getBasicRemote().sendText("Handshaking: \"Yes\", Connecté avec succès à Java");
            }
        }
}