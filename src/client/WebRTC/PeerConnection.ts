
import Peer from "simple-peer";
import socket from "../SocketConnection";


export class ClientPeerConnection {
    peerConnection: Peer.Instance;
    constructor() {
        this.peerConnection = new Peer({ initiator: true });
        this.peerConnection.on('signal', data => {
            console.log('client signaling data', data);
            socket.emit('signaling-data-to-host', data);
        });

    }
}

export class HostPeerConnection {
    peerConnection: Peer.Instance;
    clientId: string;


    constructor(clientId: string) {
        this.peerConnection = new Peer({ initiator: false });
        this.clientId = clientId;
        this.peerConnection.on('signal', data => {
            console.log('host signaling data', data);
            socket.emit('signaling-data-to-client', data, clientId);
        });
    }
}
