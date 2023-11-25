import MenuButton from "../objects/MenuButton";
import { addUserNameText, getScreenDimensions, makeMyUserAvatarInCenterOfPlayerScreen } from "../objects/Tools";
import PlayerBeforeTableGameStartDataHandler from "./playerObjects/PlayerBeforeTableGameDataHandler";
import PlayerScene from "./playerObjects/PlayerScene";

export default class PlayerBeforeTableGameStart extends PlayerScene {
    readyButton: MenuButton | null;
    leftButton: MenuButton | null;
    rightButton: MenuButton | null;
    waitingForPlayersText: Phaser.GameObjects.Text | null;
    playerBeforeGameStartDataHandler: PlayerBeforeTableGameStartDataHandler | null = null;

    constructor() {
        super({ key: 'PlayerBeforeTableGameStart' });
        this.readyButton = null;
        this.leftButton = null;
        this.rightButton = null;
        this.waitingForPlayersText = null;
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
        addUserNameText(this);
        makeMyUserAvatarInCenterOfPlayerScreen(this);
        this.addReadyButton();
        this.addLeftRightButtons();
        // this.checkIfIAmReady();
        this.addInstructions();
        this.playerBeforeGameStartDataHandler = new PlayerBeforeTableGameStartDataHandler(this);
        this.playerBeforeGameStartDataHandler.create();
    }

    addInstructions() {
        const screenDimensions = getScreenDimensions(this);
        this.add.text(100, screenDimensions.height / 3, 'Select your location on the table',
            {
                color: 'green',
                fontSize: '50px',
                wordWrap: { width: 800, useAdvancedWrap: true }
            });
    }

    showReadyButton() {
        this.readyButton?.setVisible(true);
        this.waitingForPlayersText?.setVisible(false);
    }

    hideReadyButton() {
        this.readyButton?.setVisible(false);
        this.waitingForPlayersText?.setVisible(true);
    }

    showWaitingForPlayersText() {
        this.readyButton?.setVisible(false);
        this.waitingForPlayersText?.setVisible(true);
    }

    addReadyButton() {
        const screenDimensions = getScreenDimensions(this);
        this.readyButton = new MenuButton(screenDimensions.width / 2, screenDimensions.height - 200, this);
        this.waitingForPlayersText = this.add.text(screenDimensions.width / 2, screenDimensions.height - 200, 'Waiting for other players to be ready', { color: 'orange', fontSize: '50px ' }).setOrigin(0.5);
        this.waitingForPlayersText.setVisible(false);
        this.readyButton.setText('Ready?');
        this.readyButton.on('pointerdown', () => {
            this.showWaitingForPlayersText();
            if (!this.playerBeforeGameStartDataHandler) return;
            this.playerBeforeGameStartDataHandler.playerData.ready = true;
            this.playerBeforeGameStartDataHandler.sendPlayerData();

        });
        this.add.existing(this.readyButton);
    }

    addLeftRightButtons() {
        const screenDimensions = getScreenDimensions(this);

        // Left Button
        this.leftButton = new MenuButton(200 / 2, screenDimensions.height / 2, this);
        this.leftButton.setText(' <  ');
        this.leftButton.on('pointerdown', () => {
            // Left button event logic
        });
        this.add.existing(this.leftButton);

        // Right Button
        this.rightButton = new MenuButton(screenDimensions.width - 300 / 2, screenDimensions.height / 2, this);
        this.rightButton.setText('  > ');
        this.rightButton.on('pointerdown', () => {
            // Right button event logic
        });
        this.add.existing(this.rightButton);
    }

    update(time: number, delta: number) {
        this.playerBeforeGameStartDataHandler?.update(time, delta);

    }
}


