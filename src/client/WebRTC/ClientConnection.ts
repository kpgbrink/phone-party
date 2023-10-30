import socket from "../SocketConnection";
import { ClientPeerConnection } from "./PeerConnection";

export class ClientConnection {
    hostConnection: ClientPeerConnection | null = null;
}

const clientConnection = new ClientConnection();

export default clientConnection;

let number = 0;
let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

const onConnect = () => {
    console.log('connected to host');
}

const onData = (data: any) => {
    console.log('--------- Data from host', number++, data.toString());
}

const onClose = () => {
    console.log('connection closed');
    clientConnection.hostConnection = null;
    console.log('clientConnection to host is now', clientConnection);
};

const setupConnectionListeners = (connection: ClientPeerConnection) => {
    console.log('setupConnectionListeners');
    connection.peerConnection.removeListener('connect', onConnect);
    connection.peerConnection.on('connect', onConnect);

    connection.peerConnection.removeListener('data', onData);
    connection.peerConnection.on('data', onData);

    connection.peerConnection.removeListener('close', onClose);
    connection.peerConnection.on('close', onClose);
}

export const onSignalingData = (data: any) => {
    if (clientConnection.hostConnection == null) {
        console.log('this is supposed to happen');
    }
    console.log('client dataaaaaaaaaa', data, 'clientConnection', clientConnection);
    //If the connection does not exist then create a new one
    if (!clientConnection.hostConnection) {
        clientConnection.hostConnection = new ClientPeerConnection();
    }
    setupConnectionListeners(clientConnection.hostConnection);

    clientConnection.hostConnection.peerConnection.signal(data);
    console.log('clientConnection to host is now', clientConnection);
}

// Initialize the interval to send test data every 2 seconds.
// Only one interval will be active at any point in time.
if (!intervalId) {
    intervalId = setInterval(() => {
        try {
            clientConnection?.hostConnection?.peerConnection.send('hello from client: ' + number++);
        } catch (e) {
            console.log('error sending data', e);
        }
    }, 5000);
}

export const startListeningForClientConnections = () => {
    console.log('start listening for client connections');
    socket.on('signaling-data-to-client', onSignalingData);
}

export const closeListeningForClientConnections = () => {
    socket.off('signaling-data-to-client', onSignalingData);
}
