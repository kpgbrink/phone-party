import socket from "../../SocketConnection";
import { BeforeTableGame } from "./hostObjects/hostGame/BeforeTableGame";
import HostScene from "./hostObjects/HostScene";

export default class HostBeforeTableGameScene extends HostScene {
    playerSceneKey: string = "PlayerBeforeTableGameStart";
    instructionText: Phaser.GameObjects.Text | null;
    // hostUserAvatars: HostUserAvatarsAroundTableSelectPosition | null;
    beforeTableGame: BeforeTableGame = new BeforeTableGame(this);

    constructor() {
        super({ key: 'HostBeforeTableGameScene' });
        this.instructionText = null;
    }

    preload() {
        this.beforeTableGame.preload();
    }

    create() {
        super.create();
        socket.emit('get room data');
        this.beforeTableGame.create();
    }

    update(time: number, delta: number) {
        this.beforeTableGame.update(time, delta);
    }
}
