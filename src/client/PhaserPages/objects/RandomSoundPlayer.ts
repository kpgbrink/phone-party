export class RandomSoundPlayer {
    private sounds: Phaser.Sound.BaseSound[];
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, soundKeys: string[]) {
        this.scene = scene;
        this.sounds = soundKeys.map(key => this.scene.sound.add(key));
    }

    playRandomSound() {
        const randomIndex = Phaser.Math.Between(0, this.sounds.length - 1);
        this.sounds[randomIndex].play();
    }
}