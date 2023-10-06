import Phaser from "phaser";
import HostScene from "./hostObjects/HostScene";

export default class TexasHostScene extends HostScene {
    playerSceneKey: string = "TODO";

    constructor() {
        super({ key: 'TexasHostScene' });
    }

    preload() {
        this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
    }

    create() {
        super.create();
        // display the Phaser.VERSION
        this.add
            .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
                color: '#000000',
                fontSize: '24px'
            })
            .setOrigin(1, 0)
    }

    updateFpsText() {
    }

    update() {
        this.updateFpsText();
    }
}
