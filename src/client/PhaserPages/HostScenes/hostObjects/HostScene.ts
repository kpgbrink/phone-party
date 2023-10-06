import { Game, RoomData } from "api";
import { getGameFromName } from "api/src/gamesList";
import socket from "../../../SocketConnection";
import BaseScene from "../../objects/BaseScene";
import { persistentData } from "../../objects/PersistantData";
import { loadUserAvatarSprites } from "../../objects/UserAvatarContainer";


export default abstract class HostScene extends BaseScene {
    abstract playerSceneKey: string;

    create() {
        super.create();
        // change the game playerSceneKey
        socket.emit('update game', { currentPlayerScene: this.playerSceneKey });
        const onDisconnect = () => {
            this.setUrlToHomeScreen();
        };
        // if socket disconnects then go to home screen
        socket.on('disconnect', onDisconnect);
        // every 5 seconds check if socket is connected
        const checkConnectionInterval = setInterval(() => {
            if (!socket.connected) {
                // socket disconnected
                console.log('socket disconnected');
                this.setUrlToHomeScreen();
            }
        }, 5000);

        // on room data update
        const onRoomData = (roomData: RoomData) => {
            // if no player users then go to home screen
            if (roomData.users.length === 0) {
                console.log('no users in room');
                this.setUrlToHomeScreen();
            }
            // start scene if scene is different
            persistentData.roomData = roomData;
        };
        socket.on("room data", onRoomData);

        loadUserAvatarSprites(this);
        this.scale.refresh();
        const restartGame = () => {
            // set scene back to first scene in the game scene list
            const gameName = persistentData.roomData?.game.selectedGameName;
            if (!gameName) {
                throw new Error('gameName is null');
            }
            const sceneToStart = getGameFromName(gameName).sceneOrder[0];
            this.startScene(sceneToStart);
        };
        socket.on('restart game', restartGame);
        const quitGame = () => {
            // emit window event to go back to home screen
            this.setUrlToHomeScreen();
        }
        socket.on('quit game', quitGame);

        const cleanup = () => {
            socket.off('disconnect', onDisconnect);
            socket.off('room data', onRoomData);
            socket.off('restart game', restartGame);
            socket.off('quit game', quitGame);
            clearInterval(checkConnectionInterval);
        };

        // on scene shutdown
        this.events.on('shutdown', () => {
            cleanup();
        });
        this.events.on('destroy', () => {
            cleanup();
        });
    }

    update(time: number, delta: number) {
    }

    goToNextScene() {
        // update the index to be the next game
        const selectedGameSceneIndex = persistentData.roomData?.game.selectedGameSceneIndex;
        const gameName = persistentData.roomData?.game.selectedGameName;
        if (selectedGameSceneIndex === null || selectedGameSceneIndex === undefined) {
            throw new Error('selectedGameSceneIndex is null');
        }
        if (!gameName) {
            throw new Error('gameName is null');
        }
        const updateGame: Partial<Game> = {
            selectedGameSceneIndex: selectedGameSceneIndex + 1,
        };
        socket.emit('update room data', updateGame);
        const sceneToStart = getGameFromName(gameName).sceneOrder[selectedGameSceneIndex + 1];
        this.startScene(sceneToStart)
    }

    // maybe this https://stackoverflow.com/a/68835401/2948122
    setUrlToHomeScreen() {
        // set the url to the home screen
        // change the url using react router
        const { CustomEvent } = window;
        const event = new CustomEvent('changeroute', { detail: `/room/${persistentData.roomData?.room}` });
        window.dispatchEvent(event);
    }


}
