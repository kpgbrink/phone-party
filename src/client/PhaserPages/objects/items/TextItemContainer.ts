import ItemContainer from "./ItemContainer";

export default class TextItemContainer extends ItemContainer {
    textObject: Phaser.GameObjects.Text | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y);
        this.addText(text, style);
    }

    addText(text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        this.textObject = this.scene.add.text(0, 0, text, style);
        this.add(this.textObject);
        // Adjust size based on text dimensions, consider padding if necessary
        this.setSize(this.textObject.width, this.textObject.height);
    }
}
