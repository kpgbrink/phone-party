import { BeforeTableGameData, PlayerBeforeTableGameData } from "api/src/data/datas/BeforeTableGameData";
import { MainMenuGameData } from "api/src/data/datas/MainMenuData";
import PlayerBeforeTableGameStart from "../PlayerBeforeTableGameStart";
import { PlayerDataHandler } from "./PlayerDataHandler";

export default class PlayerBeforeTableGameStartDataHandler extends PlayerDataHandler<PlayerBeforeTableGameData, BeforeTableGameData> {
    playerData: PlayerBeforeTableGameData;
    gameData: MainMenuGameData;
    scene: PlayerBeforeTableGameStart;


    constructor(scene: PlayerBeforeTableGameStart) {
        super(scene);
        this.scene = scene;
        this.playerData = new PlayerBeforeTableGameData();
        this.gameData = new MainMenuGameData();
    }

    create() {
        super.create();
    }

    getPlayerDataToSend(): Partial<PlayerBeforeTableGameData> | undefined {
        // Add the data that needs to be sent over.
        const playerData = this.playerData;
        if (playerData === undefined) return;

        return playerData;
    }

    override onPlayerDataReceived(playerData: Partial<PlayerBeforeTableGameData>, gameData: Partial<MainMenuGameData> | null): void {
        if (!playerData) return;
        if (playerData === undefined) return;
        // handle check mark changing
        const isReady = playerData.ready;
        if (!isReady) {
            this.scene.showReadyButton();
        } else {
            this.scene.hideReadyButton();
        }
        this.playerData = { ...this.playerData, ...playerData };
    }

    override getGameDataToSend() {
        const gameData = this.gameData;
        return gameData;
    }

    override onGameDataReceived(gameData: Partial<MainMenuGameData>, playerData: Partial<PlayerBeforeTableGameData> | null): void {
    }

    update(time: number, delta: number) {

    }
}
