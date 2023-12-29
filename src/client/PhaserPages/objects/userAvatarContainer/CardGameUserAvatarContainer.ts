import { User } from "../../../../shared/Types";
import { PlayerCardHandData } from "../../../../shared/data/datas/CardData";
import UserAvatarContainer from "../UserAvatarContainer";
import TextItemContainer from "../items/TextItemContainer";

export abstract class CardGameUserAvatarContainer<PlayerCardHandDataType extends PlayerCardHandData> extends UserAvatarContainer {
    playerCardHandData: PlayerCardHandDataType;
    requestDealText: TextItemContainer | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, user: User) {
        super(scene, x, y, user);
        this.playerCardHandData = this.createPlayerCardHandData();
    }

    create() {
        super.create();
        this.createRequestDealText();
    }

    createRequestDealText() {
        this.requestDealText = new TextItemContainer(this.scene, 0, 0, 'Request Deal', { fontSize: '20px', color: 'white', backgroundColor: '#000' });
        this.requestDealText.textObject?.setOrigin(0.5, 0.5);
        this.add(this.requestDealText);
        this.requestDealText.setDepth(2000);
        this.bringToTop(this.requestDealText);
        this.requestDealText.setVisible(false);
    }

    showRequestDealText() {
        console.log('showRequestDealText', this.requestDealText);
        if (!this.requestDealText) return;
        this.requestDealText.scale = 1;
        this.requestDealText.x = 0;
        this.requestDealText.y = 0;
        this.requestDealText.setVisible(true);

        this.requestDealText.startMovingOverTimeTo({
            x: 0, y: 700,
            rotation: 0,
            scale: 10
        }, 1, () => {
            this.requestDealText?.setVisible(false);
        });
    }

    abstract createPlayerCardHandData(): PlayerCardHandDataType;


    update(time: number, delta: number) {
        super.update(time, delta);
        if (this.requestDealText) {
            this.requestDealText.update(time, delta);
        }
    }
}