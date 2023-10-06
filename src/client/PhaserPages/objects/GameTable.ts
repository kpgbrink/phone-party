import { loadIfImageNotLoaded } from "./Tools";

export default class GameTable extends Phaser.GameObjects.Container {
    gameTableImage: Phaser.GameObjects.Image | null = null;
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.create();
    }

    public static preload(scene: Phaser.Scene) {
        loadIfImageNotLoaded(scene, 'table', 'assets/images/table.png');
    }

    public create() {
        this.gameTableImage = this.scene.add.image(0, 0, 'table');
        this.add(this.gameTableImage);
        this.scene.add.existing(this);
    }

    public setTablePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export const tableDimensions = {
    height: 1700,
    width: 1776,
    ovalWidth: 1632 - 310,
};