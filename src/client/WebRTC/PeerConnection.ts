import Peer from "simple-peer";
import socket from "../SocketConnection";
import { ClientConnection } from "./ClientConnection";
import { HostConnections } from "./HostConnections";

// Base class for common peer connection functionality
class BasePeerConnection {
    peerConnection: Peer.Instance;

    constructor(initiator: boolean) {
        const options = { initiator: initiator };
        this.peerConnection = new Peer(options);
        this.peerConnection.on('signal', (data) => {
            this.handleSignal(data);
        });
        this.setupConnectionListeners();
    }

    onConnect() {
        console.log('connected to peer');
    }

    onData(data: any) {
        console.log('Data from peer', data.toString());
    }

    onClose() {
        console.log('override this');
    }

    onError(err: Error) {
        console.log('override this');
    }

    setupConnectionListeners() {
        this.peerConnection.on('connect', this.onConnect);
        this.peerConnection.on('data', this.onData);
        this.peerConnection.on('close', this.onClose);
        this.peerConnection.on('error', (err) => this.onError(err));
    }

    removeAllListeners() {
        this.peerConnection.removeAllListeners();
    }

    handleSignal(data: any) {
        // This method will be overridden by the subclasses
    }

    send(data: any) {
        try {
            this.peerConnection.send(data);
        } catch (e) {
            console.error('Error sending data:', e);
            // Handle the error or retry logic here
        }
    }

    destroy() {
        this.peerConnection.removeAllListeners();
        this.peerConnection.destroy();
    }
}

export class ClientPeerConnection extends BasePeerConnection {
    clientConnection: ClientConnection;

    constructor(clientConnection: ClientConnection) {
        super(true); // Client is the initiator
        this.clientConnection = clientConnection;
    }

    handleSignal(data: any) {
        console.log('client signaling data', data);
        socket.emit('signaling-data-to-host', data);
    }

    onClose() {
        console.log('connection closed');
        this.destroy();
        this.clientConnection.hostConnection = null;
        console.log('clientConnection to host is now', this.clientConnection);
    }

    onError(error: Error) {
        console.error('Peer connection error:', error);

        // Notify the user of the connection issue
        alert("A connection error has occurred. Trying to reconnect...");

        // Try to reconnect every 2 seconds
        setInterval(() => {
            console.log('Attempting to recreate the peer connection...');
            this.clientConnection.recreatePeerConnection();
        }, 2000); // Attempt to reconnect every 2 seconds
    }
}

export class HostPeerConnection extends BasePeerConnection {
    clientId: string;
    hostConnections: HostConnections;

    constructor(clientId: string, hostConnections: HostConnections) {
        super(false); // Host is not the initiator
        this.clientId = clientId;
        this.hostConnections = hostConnections;
    }

    handleSignal(data: any) {
        console.log('host signaling data', data);
        socket.emit('signaling-data-to-client', data, this.clientId);
    }

    signal(data: any): Promise<void> {
        // This method is specific to HostPeerConnection and doesn't need to be in the base class
        return new Promise((resolve, reject) => {
            try {
                this.peerConnection.signal(data);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    onClose() {
        console.log(`Connection closed for client ${this.clientId}`);
        // Filter out the closed connection
        this.hostConnections.removeConnection(this.clientId);
        // Clean up the connection
        this.destroy();

    }

    onError(err: Error) {
        console.error('Host peer connection error:', err);
    }
}
