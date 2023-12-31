import { useEffect } from "react";
import socket from "../SocketConnection";
import { ClientPeerConnection } from "./PeerConnection";

export class ClientConnection {
    hostConnection: ClientPeerConnection | null = null;
    onConnectionReady: (() => void) | null = null;

    createClientPeerConnection = () => {
        console.log('creating client peer connection');
        this.hostConnection = new ClientPeerConnection(this);
        console.log('clientConnection is now', this);
        if (this.onConnectionReady) {
            this.onConnectionReady();
        }
    }

    recreatePeerConnection = () => {
        console.log('recreating peer connection');
        // Clean up the existing connection before creating a new one
        if (this.hostConnection && !this.hostConnection.peerConnection.destroyed) {
            this.hostConnection.peerConnection.destroy();
        }
        // Create a new peer connection instance
        this.hostConnection = new ClientPeerConnection(clientConnection);

        // Notify that connection is ready
        if (this.onConnectionReady) {
            this.onConnectionReady();
        }
    }

    setOnConnectionReadyCallback = (callback: () => void) => {
        this.onConnectionReady = callback;
    }
}

const clientConnection = new ClientConnection();

export default clientConnection;

export const onSignalingData = (data: any) => {
    console.log('Receiving signaling data from host');
    if (clientConnection.hostConnection == null) {
        console.log('this is supposed to happen');
    }
    console.log('client dataaaaaaaaaa', data, 'clientConnection', clientConnection);
    //If the connection does not exist then create a new one
    if (!clientConnection.hostConnection) {
        clientConnection.createClientPeerConnection();
    }
    if (clientConnection.hostConnection == null) {
        throw new Error('hostConnection is null')
    }

    clientConnection.hostConnection.peerConnection.signal(data);
    console.log('clientConnection to host is now', clientConnection);
}

export const startListeningForClientConnections = () => {
    console.log('start listening for client connections');
    socket.on('signaling-data-to-client', onSignalingData);
}

export const closeListeningForClientConnections = () => {
    console.log('close listening for client connections');
    socket.off('signaling-data-to-client', onSignalingData);
}

// create react custom hook to listen for connections
export const useClientConnections = () => {
    useEffect(() => {
        startListeningForClientConnections();
        return () => {
            closeListeningForClientConnections();
        }
    }, []);
}