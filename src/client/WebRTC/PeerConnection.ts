import Peer from "simple-peer";
import socket from "../SocketConnection";
import { ClientConnection } from "./ClientConnection";
import { HostConnections } from "./HostConnections";

// Base class for common peer connection functionality
class BasePeerConnection {
    dataHandler: (data: any) => void;
    peerConnection: Peer.Instance;
    notConnectedCountAllowed = 2;
    notConnectedCount = 0;

    constructor(initiator: boolean) {
        const options = { initiator: initiator };
        this.peerConnection = new Peer(options);
        this.peerConnection.on('signal', (data) => {
            this.handleSignal(data);
        });
        this.setupConnectionListeners();
        this.dataHandler = this.defaultDataHandler;
    }

    private defaultDataHandler(data: any) {
        // Default behavior or empty function
        console.log('default data handler', data);
    }

    public setDataHandler(newHandler: (data: any) => void): void {
        this.dataHandler = newHandler;
    }

    onConnect() {
        console.log('connected to peer');
    }

    onData(data: any) {
        this.dataHandler(data);
    }

    sendDataViaWebRTC(data: any): boolean {
        try {
            const jsonData = JSON.stringify(data);
            console.log('sending data via WebRTC:', jsonData);
            const sendSuccess = this.send(jsonData);
            return sendSuccess;
        } catch (error) {
            console.error('Error sending data via WebRTC:', error);
            return false;
        }
    }

    onClose() {
        console.log('override this');
    }

    onError(err: Error) {
        console.log('override this');
    }

    setupConnectionListeners() {
        this.peerConnection.on('connect', this.onConnect);
        this.peerConnection.on('data', (data) => this.onData(data));
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
            console.log('sending data is it connected', this.peerConnection.connected);
            if (!this.peerConnection.connected) {
                this.notConnectedCount++;
                if (this.notConnectedCount > this.notConnectedCountAllowed) {
                    console.log('not connected count exceeded');
                    this.notConnectedCount = 0;
                    this.handleSendError('not connected count exceeded');
                }
                // not yet connected fail this 
                console.log('not yet connected');
                return false;
            }
            this.peerConnection.send(data);
        } catch (e) {
            // console.error('Error sending data:', e);
            // Handle the error or retry logic here
            console.log('failed to send data let fix that');
            this.handleSendError(e);
            throw e;
        }
        return true;
    }

    handleSendError(error: any) {
        console.log('override this');
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
        console.log('123123 creating client peer connection');
        this.clientConnection = clientConnection;
    }

    handleSignal(data: any) {
        console.log('client signaling data', data);
        socket.emit('signaling-data-to-host', data);
    }

    onClose() {
        console.log('connection closed');
        this.destroy();
        console.log('clientConnection to host is now', this.clientConnection);
    }

    onError(error: Error) {
        console.error('Peer connection error:', error);

        // Notify the user of the connection issue
        // alert("A connection error has occurred. Trying to reconnect...");

        // Try to reconnect every 2 seconds
        setInterval(() => {
            console.log('Attempting to recreate the peer connection...');
            this.clientConnection.recreatePeerConnection();
        }, 2000); // Attempt to reconnect every 2 seconds
    }

    handleSendError(error: any): void {
        console.error('Error sending data:', error);
        // Handle the error or retry logic here
        console.log('this.clientConnection', this.clientConnection);
        try {
            this.clientConnection.recreatePeerConnection();
        } catch (e) {
            console.log('error', e);
        }
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

    handleSendError(error: any): void {
        console.error('Error sending data:', error);
        // Handle the error or retry logic here
        this.hostConnections.removeConnection(this.clientId);
        this.destroy()
    }
}
