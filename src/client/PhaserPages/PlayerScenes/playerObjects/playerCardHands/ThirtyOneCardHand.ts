import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import socket from "../../../../SocketConnection";
import MenuButton from "../../../objects/MenuButton";
import { persistentData } from "../../../objects/PersistantData";
import { getScreenDimensions } from "../../../objects/Tools";
import { PlayerCardHand } from "../PlayerCardHand";
import PlayerScene from "../PlayerScene";


export class ThirtyOneCardHand extends PlayerCardHand<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    playerData: ThirtyOnePlayerCardHandData;
    gameData: ThirtyOneCardGameData;

    constructor(scene: PlayerScene) {
        super(scene);
        this.playerData = new ThirtyOnePlayerCardHandData();
        this.gameData = new ThirtyOneCardGameData();
    }

    // ------------------------------------ Data ------------------------------------
    override getPlayerDataToSend(): Partial<ThirtyOnePlayerCardHandData> | undefined {
        super.getPlayerDataToSend();
        return this.playerData;
    }

    override onPlayerDataReceived(playerData: Partial<ThirtyOnePlayerCardHandData>, gameData: Partial<ThirtyOneCardGameData> | null) {
        super.onPlayerDataReceived(playerData, gameData);
        if (playerData === undefined) return;
        if (gameData === undefined) return;
        // check if can knock
        this.updateKnockButton(playerData, gameData);
        this.playerData = { ...this.playerData, ...playerData };
    }

    updateKnockButton(playerData: Partial<ThirtyOnePlayerCardHandData>, gameData: Partial<ThirtyOneCardGameData> | null) {
        const userId = persistentData.myUserId;
        const canKnock = gameData?.knockPlayerId === null
            && playerData?.cardIds?.length === 3
            && gameData?.playerTurnId === userId
            && gameData?.gameOver === false
            && gameData?.roundOver === false;
        this.knockButton?.setVisible(canKnock);
    }

    override getGameDataToSend(): Partial<ThirtyOneCardGameData> | undefined {
        const gameData = super.getGameDataToSend();
        return gameData;
    }
    override onGameDataReceived(gameData: Partial<ThirtyOneCardGameData>): void {
        super.onGameDataReceived(gameData);
        this.gameData = { ...this.gameData, ...gameData };
    }
    // ------------------------------------ Data End ------------------------------------

    listenForState: string = "playerDataToUser";

    knockButton: MenuButton | null = null;

    create() {
        super.create();

        const screenDimensions = getScreenDimensions(this.scene);
        this.knockButton = new MenuButton(screenDimensions.width - 200, screenDimensions.height - 80, this.scene);
        this.knockButton.setInteractive();
        this.knockButton.setText('Knock');
        this.knockButton.on('pointerdown', () => {
            this.gameData.knockPlayerId = persistentData.myUserId;
            socket.emit('thirty one knock');
            this.setAllowedPickUpCardAmount(0);
            this.sendData(true);
        });
        this.knockButton.setVisible(false);
        this.scene.add.existing(this.knockButton);
    }

    setAllowedPickUpCardAmount(amount: number): void {
        super.setAllowedPickUpCardAmount(amount);
        this.knockButton?.setVisible(amount !== 0 && this.gameData.knockPlayerId === null);
    }

    onAllCardsPickedUp(): void {
        // set 1 card to be able to put down.
        if (this.gameData.knockPlayerId === persistentData.myUserId) return; // prevent picking up if you knocked.
        this.updateAllowedDropCardAmount(this.playerData);
    }
}