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
public class WebSocket_Server {
    @javax.websocket.server.ServerEndpoint(value = "/BCMS")
    public static class My_ServerEndpoint {
        private static java.util.Map<String, String> _sessions = new java.util.HashMap<>();
        private static BCMS _bCMS = null;
        static {
           try{
               _bCMS = new BCMS();
               _bCMS.start();
           }
           catch(java.lang.Exception e){
               e.printStackTrace();
           }
        }
        @javax.websocket.OnClose
        public void onClose(javax.websocket.Session session, javax.websocket.CloseReason close_reason) {   
            System.out.println("onClose: " + close_reason.getReasonPhrase());
        }
        @javax.websocket.OnError
        public void onError(javax.websocket.Session session, Throwable throwable) {
            System.out.println("onError: " + throwable.getMessage());
        }
        @javax.websocket.OnMessage
        public void onMessage(javax.websocket.Session session, String message) throws java.lang.Exception{
            System.out.println("Message de JavaScript: " + message);
            //java.util.Set<javax.websocket.Session> sessions = session.getOpenSessions();
            //System.out.println("Sessions ouvertes: " + sessions.size());
            switch(message){
                case "policier": 
                    System.out.println("Policier");
                    _sessions.put("Policier", session.getId());
                    
                    _bCMS.FSC_connection_request();
                    break;
                case "pompier":
                    _sessions.put("Pompier", session.getId());
                    System.out.println("Pompier");
                    break;
            }
        }
        @javax.websocket.OnOpen
        public void onOpen(javax.websocket.Session session, javax.websocket.EndpointConfig ec) throws java.io.IOException, java.lang.Exception {
            System.out.println("OnOpen... " + ec.getUserProperties().get("Author"));
            session.getBasicRemote().sendText("Handshaking: \"Yes\", Connecté avec succès à Java");
        }
    }
}
