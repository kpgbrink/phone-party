import { RoomData } from "api";
import Phaser from "phaser";
import { palletColors } from "../../../Palettes";
import socket from "../../../SocketConnection";
import { startListeningForClientConnections } from "../../../WebRTC/ClientConnection";
import BaseScene from "../../objects/BaseScene";
import MenuButton from "../../objects/MenuButton";
import { persistentData } from "../../objects/PersistantData";
import { addFullScreenButton, loadIfImageNotLoaded, loadIfSpriteSheetNotLoaded } from "../../objects/Tools";
import UserAvatarContainer, { preloadUserAvatarSprites } from "../../objects/UserAvatarContainer";

export default class PlayerScene extends BaseScene {
    createMenuOnScene: boolean = true;
    userAvatarContainer: UserAvatarContainer | null;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.userAvatarContainer = null;
    }

    preload() {
        loadIfSpriteSheetNotLoaded(this, 'fullscreen', 'assets/ui/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
        loadIfSpriteSheetNotLoaded(this, 'fullscreen-white', 'assets/ui/fullscreen-white.png', { frameWidth: 64, frameHeight: 64 });
        preloadUserAvatarSprites(this);
        loadIfImageNotLoaded(this, 'menuButton', 'assets/ui/menuButton.png');
    }

    create() {
        super.create();
        startListeningForClientConnections();
        console.log('listen for client connections');
        // if socket disconnects then go to home screen
        const onDisconnect = () => {
            window.location.reload();
        };
        socket.on('disconnect', onDisconnect);
        const onRoomData = (roomData: RoomData) => {
            // If room is undefined or no Host user then refresh the page
            if (!roomData || !roomData.hostUser) {
                window.location.reload();
            }
            // start scene if scene is different
            (() => {
                if (!roomData?.game.currentPlayerScene) {
                    return;
                }
                if (this.scene.key === roomData.game.currentPlayerScene) {
                    return;
                }

                window.dispatchEvent(new CustomEvent('showGamesListMenu', { detail: { show: false } }));
                this.startScene(roomData.game.currentPlayerScene);
            })();
            // check if I am in the game 
            (() => {
                if (!roomData) {
                    return;
                }
                // find my user
                const myUser = roomData.users.find(user => user.id === persistentData.myUserId);
                if (!myUser) {
                    return;
                }
                // check if I am in the game
                if (!myUser.inGame && roomData.game.currentPlayerScene !== 'PlayerStartingScene') {
                    socket.emit('quit game');
                }
            })();
            persistentData.roomData = roomData;
        };

        socket.on("room data", onRoomData);
        addFullScreenButton(this);
        socket.emit('get room data');
        this.scale.refresh();
        // add scale refresh event listenerw
        // remove resize event listener
        const abortController = new AbortController();
        this.resizeSpecial();
        window.addEventListener('resizeSpecial', () => { this.resizeSpecial() }, { signal: abortController.signal });
        this.events.on('shutdown', () => {
            abortController.abort();
        });
        this.createMenu();

        const cleanup = () => {
            socket.off('room data', onRoomData);
            socket.off('disconnect', onDisconnect);
            window.removeEventListener('resizeSpecial', () => { this.resizeSpecial() });
        }

        // on scene shutdown remove event listener
        this.events.on('shutdown', () => {
            cleanup();
        });
        this.events.on('destroy', () => {
            cleanup();
        });
    }

    resizeSpecial() {
        console.log('current scene', this.scene.key);
        this.scale.refresh();
    }

    openMenuButton: Phaser.GameObjects.Image | null = null;
    menuPanel: Phaser.GameObjects.Rectangle | null = null;
    restartMenuButton: MenuButton | null = null;
    quitGameMenuButton: MenuButton | null = null;
    xButton: Phaser.GameObjects.Text | null = null;

    createMenu() {
        if (!this.createMenuOnScene) return;
        // make a button at the top left of screen that opens a dropdown menu
        const menuButton = this.add.image(0, 0, 'menuButton').setOrigin(0, 0);
        menuButton.scale = 0.5;
        menuButton.setInteractive({ userHandCursor: true });
        menuButton.on('pointerover', () => {
            // set tint
            const colorNumber = Phaser.Display.Color.HexStringToColor(palletColors.color3).color;
            menuButton.setTint(colorNumber);
        });
        menuButton.on('pointerout', () => {
            // remove tint
            menuButton.clearTint();
        });
        this.openMenuButton = menuButton;

        // create menu buttons that become visible when menu button is pressed
        // make a panel that holds the menu buttons
        // convert color string to color number
        const colorNumber = Phaser.Display.Color.HexStringToColor(palletColors.color5).color;
        const menuPanel = this.add.rectangle(0, 0, 800, 800, colorNumber, 0.98).setOrigin(0, 0);
        this.menuPanel = menuPanel;


        // add x button to close menu
        const xButton = this.add.text(5, 5, 'X', { fontSize: '100px', color: '#ffffff' }).setOrigin(0, 0);
        xButton.setInteractive({ userHandCursor: true });
        xButton.on('pointerover', () => {
            // set tint
            const colorNumber = Phaser.Display.Color.HexStringToColor(palletColors.color3).color;
            xButton.setTint(colorNumber);
        });
        xButton.on('pointerout', () => {
            // remove tint
            xButton.clearTint();
        });
        this.xButton = xButton;

        // Restart Game
        const restartGameMenuButton = new MenuButton(0, 200, this);
        restartGameMenuButton.setText('Restart Game');
        restartGameMenuButton.setOrigin(0);
        restartGameMenuButton.on('pointerdown', () => {
            socket.emit('restart game');
            this.closeMenu();
        });
        this.restartMenuButton = restartGameMenuButton;
        this.add.existing(restartGameMenuButton);

        // Quit Game
        const quitGameMenuButton = new MenuButton(0, 400, this);
        quitGameMenuButton.setText('Quit Game');
        quitGameMenuButton.setOrigin(0);
        quitGameMenuButton.on('pointerdown', () => {
            socket.emit('quit game');
            this.closeMenu();
        });
        this.quitGameMenuButton = quitGameMenuButton;
        this.add.existing(quitGameMenuButton);

        xButton.on('pointerdown', () => {
            this.closeMenu();
        });

        menuButton.on('pointerdown', () => {
            this.openMenu();
        });

        // set the z index of all of these to be above everything else
        menuPanel.setDepth(1000);
        menuButton.setDepth(1000);
        xButton.setDepth(1000);
        restartGameMenuButton.setDepth(1000);
        quitGameMenuButton.setDepth(1000);

        // set everything to invisible except for the menu button
        menuPanel.visible = false;
        xButton.visible = false;
        restartGameMenuButton.visible = false;
        quitGameMenuButton.visible = false;
    }

    openMenu() {
        if (!this.createMenuOnScene) return;
        if (!this.openMenuButton) return;
        if (!this.xButton) return;
        if (!this.menuPanel) return;
        if (!this.restartMenuButton) return;
        if (!this.quitGameMenuButton) return;
        this.openMenuButton.visible = false;
        this.xButton.visible = true;
        this.menuPanel.visible = true;
        this.restartMenuButton.visible = true;
        this.quitGameMenuButton.visible = true;
        // check if pointer is clicked within the menu panel
        this.input.on('pointerdown', this.outsideMenuPointerDown, this);
    }

    outsideMenuPointerDown(pointer: Phaser.Input.Pointer) {
        console.log('pointerdown');
        if (!this.menuPanel) return;
        if (pointer.x > this.menuPanel.x && pointer.x < this.menuPanel.x + this.menuPanel.width) {
            if (pointer.y > this.menuPanel.y && pointer.y < this.menuPanel.y + this.menuPanel.height) {
                return;
            }
        }
        console.log('pointer clicked outside of menu panel');
        this.closeMenu();
    }

    closeMenu() {
        if (!this.createMenuOnScene) return;
        if (!this.openMenuButton) return;
        if (!this.xButton) return;
        if (!this.menuPanel) return;
        if (!this.restartMenuButton) return;
        if (!this.quitGameMenuButton) return;
        this.openMenuButton.visible = true;
        this.xButton.visible = false;
        this.menuPanel.visible = false;
        this.restartMenuButton.visible = false;
        this.quitGameMenuButton.visible = false;
        // remove pointerdown event listener
        this.input.off('pointerdown', this.outsideMenuPointerDown, this);
    }
}
