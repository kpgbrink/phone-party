import { User } from 'api';
import { PlayerCardHandData } from 'api/src/data/datas/CardData';
import UserAvatarContainer from "../UserAvatarContainer";

export abstract class CardGameUserAvatarContainer<PlayerCardHandDataType extends PlayerCardHandData> extends UserAvatarContainer {
    playerCardHandData: PlayerCardHandDataType;

    constructor(scene: Phaser.Scene, x: number, y: number, user: User) {
        super(scene, x, y, user);
        this.playerCardHandData = this.createPlayerCardHandData();
    }

    abstract createPlayerCardHandData(): PlayerCardHandDataType;

}