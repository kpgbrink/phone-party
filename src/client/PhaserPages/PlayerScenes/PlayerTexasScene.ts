import Phaser from "phaser";
import PlayerScene from "./playerObjects/PlayerScene";


export default class PlayerTexasScene extends PlayerScene {
    constructor() {
        super({ key: 'PlayerTexasScene' });
    }

    create() {
        super.create();
        // display the Phaser.VERSION
        this.add
            .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
                color: 'red',
                fontSize: '24px'
            })
            .setOrigin(1, 0);
    }

    update() {
    }
}
