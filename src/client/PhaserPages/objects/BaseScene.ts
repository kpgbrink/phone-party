

// create base phaser scene
export default abstract class BaseScene extends Phaser.Scene {
    changingSceneTo: string | null = null;

    create() {
        this.changingSceneTo = null;
    }

    // start changing scene
    startScene(sceneKey: string) {
        // if scene is already changing to the scene then don't change scene
        if (this.changingSceneTo === sceneKey) {
            return;
        }
        this.scene.start(sceneKey);
        this.changingSceneTo = sceneKey;
    }


}