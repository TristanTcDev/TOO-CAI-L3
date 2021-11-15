module BCMS {
    requires java.sql;
    requires PauWareTwo;
    requires javax.websocket.api;
    requires tyrus.server;
    requires java.desktop;
    requires java.json;
    opens com.franckbarbier.BCMS to PauWareTwo;
}
