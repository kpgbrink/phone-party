import { GameData, PlayerData } from "api/src/data/Data";
import { persistentData } from "../../objects/PersistantData";
import { HostDataHandler } from "./HostDataHandler";
import { HostGameState } from "./hostGame/states/HostGameState";
import HostScene from "./HostScene";

export abstract class HostGame<PlayerDataType extends PlayerData, GameDataType extends GameData>
    extends HostDataHandler<PlayerDataType, GameDataType> {
    hostScene: HostScene;
    currentState: HostGameState<PlayerDataType, GameDataType> | null = null;
    abstract gameData: GameDataType;

    constructor(hostScene: HostScene) {
        super();
        this.hostScene = hostScene;
    }

    preload() {
        // check if there are any users. if not then go back to the home screen
        const users = persistentData.roomData?.users;
        if (!users || users.length === 0) {
            this.hostScene.setUrlToHomeScreen();
        }
    }

    create() {
        super.create();
        // destroy on scene shutdown
        this.hostScene.events.on('destroy', () => {
            this.destroy();
        });
        this.hostScene.events.on("shutdown", () => {
            this.destroy();
        });
    }

    // PlayerData --------------------
    getPlayerDataToSend(userId: string): Partial<PlayerDataType> | undefined {
        return this.currentState?.getPlayerDataToSend(userId);
    }

    onPlayerDataReceived(userId: string, playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null) {
        this.currentState?.onPlayerDataReceived(userId, playerData, gameData);
    }

    // GameData --------------------
    getGameDataToSend(): Partial<GameDataType> | undefined {
        return this.currentState?.getGameDataToSend();
    }

    onGameDataReceived(userId: string, gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null, updateGameData: boolean) {
        this.currentState?.onGameDataReceived(userId, gameData, playerData, updateGameData);
    }
    // --- end data ---
    update(time: number, delta: number) {
        var newState = this.currentState?.update(time, delta) || null;
        this.changeState(newState);
    }

    // the only way I should change the states is by calling this method
    changeState(newState: HostGameState<PlayerDataType, GameDataType> | null) {
        if (!newState) return;
        this.currentState?.exit();
        this.currentState = newState;
        this.currentState.enter();
    }


}