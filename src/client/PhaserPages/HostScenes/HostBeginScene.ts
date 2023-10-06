import { RoomData } from "api";
import { getGameFromName } from "api/src/gamesList";
import socket from "../../SocketConnection";
import HostScene from "./hostObjects/HostScene";

// Just the starting scene before transitioning to the game scene
export default class HostBeginScene extends HostScene {
    playerSceneKey: string = "PlayerStartingScene";

    currentSceneChangingTo: string | null = null;

    constructor() {
        super({ key: 'HostBeginScene' });
    }

    create() {
        super.create();
        // immediatly move to the selected game starting scene
        // on room data update
        const roomDataName = (roomData: RoomData) => {
            if (!roomData.game.selectedGameName) return;
            const game = getGameFromName(roomData.game.selectedGameName);
            if (game) {
                // only start the scene if it is not the current scene
                // this doesn't work because the scene is not active yet
                // fix
                this.startScene(game.sceneOrder[0]);
            }
        };

        socket.on('room data', roomDataName);

        socket.emit('get room data');

        const cleanup = () => {
            console.log('host begin scene shutdown');
            socket.off('room data', roomDataName);
        };

        // on scene shutdown
        this.events.on('shutdown', () => {
            cleanup();
        });

        // on scene destroy
        this.events.on('destroy', () => {
            cleanup();
        });
    }

    startGame() {
        // get the sceneOrder from the game

    }
}
