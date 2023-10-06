import socket from "../SocketConnection";
import { ClientPeerConnection } from "./PeerConnection";

// a client that will be connected to the host user
export class ClientConnection {
    hostConnection: ClientPeerConnection | null = null;
}

// create global client connection object
const clientConnection = new ClientConnection();

export default clientConnection;

let number = 0;
let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

const onConnect = () => {
    console.log('connected to host');
}

const onData = (data: any) => {
    console.log('data from host', number++, data.toString());
}

const onClose = () => {
    console.log('connection closed');
    clientConnection.hostConnection = null;
    console.log('clientConnection to host is now', clientConnection);
};

export const onSignalingData = (data: any) => {
    console.log('client data', data);
    console.log('clientConnection to host is now', clientConnection)
    if (!clientConnection.hostConnection) {
        clientConnection.hostConnection = new ClientPeerConnection();
    }
    clientConnection.hostConnection.peerConnection.signal(data);
    console.log('clientConnection to host is now', clientConnection);

    clientConnection.hostConnection.peerConnection.removeListener('connect', onConnect);
    clientConnection.hostConnection.peerConnection.on('connect', onConnect);

    clientConnection.hostConnection.peerConnection.removeListener('data', onData);
    clientConnection.hostConnection.peerConnection.on('data', onData);

    console.log('client stuff', clientConnection.hostConnection.peerConnection);

    clientConnection.hostConnection.peerConnection.removeListener('close', onClose);
    clientConnection.hostConnection.peerConnection.on('close', onClose);

    let count = 0;
    // remove this interval if recreating it

    if (intervalId) {
        console.log('clearing interval', intervalId, '...')
        clearInterval(intervalId);
    }
    // every 2 seconds send test data
    intervalId = setInterval(() => {
        console.log('trying to send test data');
        if (clientConnection.hostConnection && clientConnection.hostConnection.peerConnection) {
            clientConnection.hostConnection.peerConnection.send('hello from client: ' + count++);
        }
    }, 5000);
    console.log("intervalId", intervalId);
    // send tes data to host
    // clientConnection.hostConnection.peerConnection.send('hello from client');
}

// start listening for client connections*
export const startListeningForClientConnections = () => {
    socket.on('signaling-data-to-client', onSignalingData);
}

// stop listening for client connections
export const closeListeningForClientConnections = () => {
    socket.off('signaling-data-to-client', onSignalingData);
}
