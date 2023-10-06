import { User } from 'api';
import { PlayerBeforeTableGameData } from 'api/src/data/datas/BeforeTableGameData';
import UserAvatarContainer from "../UserAvatarContainer";

export class BeforeTableGameUserAvatarContainer extends UserAvatarContainer {
    beforeTableGamePlayerData: PlayerBeforeTableGameData;
    readyCheckMark: Phaser.GameObjects.Image | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, user: User) {
        super(scene, x, y, user);
        this.beforeTableGamePlayerData = this.createPlayerBeforeTableData();
    }

    create() {
        this.createReadyCheckMark();
    }

    createReadyCheckMark() {
        this.readyCheckMark = this.scene.add.image(0, 0, 'checkmark');
        this.readyCheckMark.setOrigin(0.5, 0.5);
        this.readyCheckMark.setScale(0.2);
        this.readyCheckMark.setVisible(false);
        this.add(this.readyCheckMark);
    }

    setReady() {
        this.beforeTableGamePlayerData.ready = true;
        this.readyCheckMark?.setVisible(true);
    }

    createPlayerBeforeTableData(): PlayerBeforeTableGameData {
        return new PlayerBeforeTableGameData();
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }

}