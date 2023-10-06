import { Transform } from "../Tools";
import { ValueWithDefault } from "../ValueWithDefault";
import ItemContainer from "./ItemContainer";


interface CardContent {
    suit: string | null;
    rank: string | null;
    joker: boolean | null;
}

export default class CardContainer extends ItemContainer {
    cardContent: CardContent;
    timeInHand: number = 0;

    backImage: Phaser.GameObjects.Image | null = null;
    frontImage: Phaser.GameObjects.Image | null = null;
    velocity: { x: number, y: number, rotation: number } = { x: 0, y: 0, rotation: 0 };
    mass: number = 1;
    id: number;

    inHandFaceUp: boolean = false;

    cardInHandOffsetTransform: ValueWithDefault<Transform> = new ValueWithDefault({ x: 0, y: 0, rotation: 0, scale: 1 });

    isPickUpFaceUpCard() {
        return this.canTakeFromTable && this.getFaceUp();
    }
    isPickUpFaceDownCard() {
        return this.canTakeFromTable && !this.getFaceUp();
    }

    constructor(scene: Phaser.Scene, x: number, y: number, cardId: number, suit: string, rank: string, joker: boolean = false) {
        super(scene, x, y);
        this.id = cardId;
        // take the 
        this.cardContent = {
            suit,
            rank,
            joker
        };
        this.frontImage = null;
        this.addCardImages();
    }

    public setDefault() {
        this.setFaceUp(false);
    }

    public addCardImages() {
        // add the back of the card
        this.backImage = this.scene.add.image(0, 0, 'cards', 'back');
        this.add(this.backImage);
        // add the card image
        this.frontImage = this.scene.add.image(0, 0, 'cards', this.getCardImageName());
        this.add(this.frontImage);
        // hide the card image
        this.frontImage.visible = false;
        // set the card image to the back
        this.setSize(this.backImage.width, this.backImage.height);
    }

    public getCardImageName() {
        if (this.cardContent.joker) {
            return 'joker';
        }
        return `${this.cardContent.suit}${this.cardContent.rank}`;
    }

    public setFaceUp(faceUp: boolean) {
        // Switch the card image to the back or front
        if (!this.frontImage || !this.backImage) return;
        this.frontImage.visible = faceUp;
        this.backImage.visible = !faceUp;
    }

    public getFaceUp() {
        return this.frontImage?.visible;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
    }
}