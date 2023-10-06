import { palletColors } from "../../Palettes";



export default class MenuButton extends Phaser.GameObjects.Text {
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(scene, x, y, '', {
            fontSize: '100px',
            color: palletColors.color2,
            stroke: palletColors.color2,
            strokeThickness: 4,
            fontFamily: 'Arial',
        });
        this.setOrigin(0.5);
        this.setPadding(20);
        this.setStyle({ backgroundColor: palletColors.color4, borderRadius: 10 });
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => { this.setStyle({ color: palletColors.color3, stroke: palletColors.color3 }); });
        this.on('pointerout', () => { this.setStyle({ color: palletColors.color2, stroke: palletColors.color2 }); });
    }
}