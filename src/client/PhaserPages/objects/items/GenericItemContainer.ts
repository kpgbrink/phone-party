import ItemContainer from "./ItemContainer";


export default class GenericItemContainer extends ItemContainer {
    image: Phaser.GameObjects.Image | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, image: string) {
        super(scene, x, y);
        this.addImage(image);
    }

    addImage(image: string) {
        this.image = this.scene.add.image(0, 0, image);
        this.add(this.image);
        this.setSize(this.image.width, this.image.height);
    }
}