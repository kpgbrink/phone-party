import { MainMenuGameData, PlayerMainMenuData } from "api/src/data/datas/MainMenuData";
import MenuButton from "../../objects/MenuButton";
import { persistentData } from "../../objects/PersistantData";
import { getScreenDimensions } from "../../objects/Tools";
import PlayerStartingScene from "../PlayerStartingScene";
import { PlayerDataHandler } from "./PlayerDataHandler";

export default class PlayerMenu extends PlayerDataHandler<PlayerMainMenuData, MainMenuGameData> {
    selectGameButton: MenuButton | null = null;

    playerData: PlayerMainMenuData;
    gameData: MainMenuGameData;
    scene: PlayerStartingScene;


    constructor(scene: PlayerStartingScene) {
        super(scene);
        this.scene = scene;
        this.playerData = new PlayerMainMenuData();
        this.gameData = new MainMenuGameData();
    }

    create() {
        super.create();
        this.addSelectGameButton();
    }

    addSelectGameButton() {
        const screenDimensions = getScreenDimensions(this.scene);
        this.selectGameButton = new MenuButton(screenDimensions.width / 2, screenDimensions.height - 720, this.scene);
        this.selectGameButton.setText("Select Game");
        this.selectGameButton?.setVisible(false);
        this.selectGameButton.on('pointerdown', () => {
            this.gameData.mainMenuPosition = 1;
            this.updateMainMenuPosition(this.gameData);
            this.selectGameButton?.setVisible(false);
            this.sendData();
        });
        this.selectGameButton.setDepth(1111);
        this.scene.add.existing(this.selectGameButton);
    }

    override getPlayerDataToSend() {
        // Add the data that needs to be sent over.
        const playerData = this.playerData;
        if (persistentData.myUserId === null) return;
        // const userId = persistentData.myUserId;

        return playerData;
    }

    override onPlayerDataReceived(playerData: Partial<PlayerMainMenuData>, gameData: Partial<MainMenuGameData> | null): void {
        if (!playerData) return;
        if (playerData === undefined) return;

        this.playerData = { ...this.playerData, ...playerData };
    }


    override getGameDataToSend() {
        const gameData = this.gameData;
        return gameData;
    }

    override onGameDataReceived(gameData: Partial<MainMenuGameData>, playerData: Partial<PlayerMainMenuData> | null): void {
        this.updateMainMenuPosition(gameData);
    }

    updateMainMenuPosition(gameData: Partial<MainMenuGameData>) {
        // update the main menu position
        if (gameData.mainMenuPosition === undefined) return;
        if (gameData.mainMenuPosition === null) return;
        const mainMenuPosition0 = gameData.mainMenuPosition === 0;
        this.selectGameButton?.setVisible(mainMenuPosition0);
        if (mainMenuPosition0) {
            // turn everything back on
            this.scene.nameFormElement?.setVisible(true);
            this.scene.nameFormElement?.setInteractive();
            this.scene.nameFormElement?.setActive(true);
            this.selectGameButton?.setVisible(true);
            this.selectGameButton?.setInteractive();
            this.selectGameButton?.setActive(true);

            window.dispatchEvent(new CustomEvent('showGamesListMenu', { detail: { show: false } }));
        }

        // if the main menu position is 1 then show the gamesListmenu
        if (gameData.mainMenuPosition === 1) {
            // turn off everything on screen
            this.scene.nameFormElement?.setVisible(false);
            this.scene.nameFormElement?.disableInteractive();
            this.scene.nameFormElement?.setActive(false);
            this.selectGameButton?.setVisible(false);
            this.selectGameButton?.disableInteractive();
            this.selectGameButton?.setActive(false);
            // hide full screen button if it is visible

            // make showGamesListMenu event happen
            window.dispatchEvent(new CustomEvent('showGamesListMenu', { detail: { show: true } }));
        }

    }

    update(time: number, delta: number) {

    }
}
