import { RoomData, User, UserAvatar } from "api";
import Phaser from "phaser";
import socket from "../../SocketConnection";
import { avatarImages } from "./avatarImages.generated";
import { persistentData } from "./PersistantData";
import { loadIfImageNotLoadedAndUserAvatarHasIt, randomIndex } from "./Tools";

export const playerFolder = 'assets/player/';

// Random change of returning a -1 
const randomNegativeOne = (negative1Chance: number) => {
    return Math.random() < negative1Chance ? -1 : null;
}


export const generateRandomUserAvatar = (): UserAvatar => {
    const base = randomIndex(avatarImages.base);
    const beard = randomNegativeOne(.8) || randomIndex(avatarImages.beard);
    const body = randomNegativeOne(.01) || randomIndex(avatarImages.body);
    const cloak = randomNegativeOne(.99) || randomIndex(avatarImages.cloak);
    const gloves = randomNegativeOne(.60) || randomIndex(avatarImages.gloves);
    const boots = randomNegativeOne(.05) || randomIndex(avatarImages.boots);
    const hair = randomNegativeOne(.10) || randomIndex(avatarImages.hair);
    const head = randomNegativeOne(.15) || randomIndex(avatarImages.head);
    const legs = randomNegativeOne(.03) || randomIndex(avatarImages.legs);
    const userAvatar = { base, beard, body, cloak, gloves, boots, hair, head, legs };
    socket.emit('set player avatar', userAvatar);
    return userAvatar;
}

export const preloadUserAvatarSprites = (scene: Phaser.Scene) => {
    // use persistentData 
    persistentData.roomData?.users.forEach((user) => {
        const userId = user.id;
        const userAvatar = user.userAvatar;
        if (!userAvatar) return;
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-base`, `${playerFolder}base/${avatarImages.base[userAvatar.base]}`, userAvatar.base);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-cloak`, `${playerFolder}cloak/${avatarImages.cloak[userAvatar.cloak]}`, userAvatar.cloak);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-gloves`, `${playerFolder}gloves/${avatarImages.gloves[userAvatar.gloves]}`, userAvatar.gloves);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-body`, `${playerFolder}body/${avatarImages.body[userAvatar.body]}`, userAvatar.body);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-beard`, `${playerFolder}beard/${avatarImages.beard[userAvatar.beard]}`, userAvatar.beard);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-boots`, `${playerFolder}boots/${avatarImages.boots[userAvatar.boots]}`, userAvatar.boots);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-hair`, `${playerFolder}hair/${avatarImages.hair[userAvatar.hair]}`, userAvatar.hair);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-head`, `${playerFolder}head/${avatarImages.head[userAvatar.head]}`, userAvatar.head);
        loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-legs`, `${playerFolder}legs/${avatarImages.legs[userAvatar.legs]}`, userAvatar.legs);
    });
}

// only use this on the player for now. hopefully fix later...
export const loadUserAvatarSprites = (scene: Phaser.Scene) => {
    const onRoomData = (roomData: RoomData) => {
        if (!roomData) return;
        if (!roomData.users) return;
        roomData.users.forEach(user => {
            const userId = user.id;
            const userAvatar = user.userAvatar;
            if (!userAvatar) return;
            console.log('scene', userId, avatarImages.base[userAvatar.base], userAvatar);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-base`, `${playerFolder}base/${avatarImages.base[userAvatar.base]}`, userAvatar.base);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-cloak`, `${playerFolder}cloak/${avatarImages.cloak[userAvatar.cloak]}`, userAvatar.cloak);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-gloves`, `${playerFolder}gloves/${avatarImages.gloves[userAvatar.gloves]}`, userAvatar.gloves);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-body`, `${playerFolder}body/${avatarImages.body[userAvatar.body]}`, userAvatar.body);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-beard`, `${playerFolder}beard/${avatarImages.beard[userAvatar.beard]}`, userAvatar.beard);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-boots`, `${playerFolder}boots/${avatarImages.boots[userAvatar.boots]}`, userAvatar.boots);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-hair`, `${playerFolder}hair/${avatarImages.hair[userAvatar.hair]}`, userAvatar.hair);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-head`, `${playerFolder}head/${avatarImages.head[userAvatar.head]}`, userAvatar.head);
            loadIfImageNotLoadedAndUserAvatarHasIt(scene, `${userId}-legs`, `${playerFolder}legs/${avatarImages.legs[userAvatar.legs]}`, userAvatar.legs);
            scene.load.start();
        });
    };

    socket.on('room data', onRoomData);

    const cleanup = () => {
        socket.off('room data', onRoomData);
    }
    // on scene shutdown remove the listener
    scene.events.on('shutdown', () => {
        cleanup();
    });

    scene.events.on('destroy', () => {
        cleanup();
    });
}

export const makeMyUserAvatar = (scene: Phaser.Scene, x: number, y: number, userAvatarContainer: UserAvatarContainer | null) => {
    if (!persistentData.myUserId || userAvatarContainer) return;
    const user = persistentData.roomData?.users.find(user => user.id === persistentData.myUserId);
    if (!user) return;
    userAvatarContainer = new UserAvatarContainer(scene, x, y, user);
    scene.add.existing(userAvatarContainer);
    // userAvatarContainer.setScale(10);
    return userAvatarContainer;
}

export default class UserAvatarContainer extends Phaser.GameObjects.Container {
    user: User;
    cloakImage: Phaser.GameObjects.Image | null;
    bodyImage: Phaser.GameObjects.Image | null;
    baseImage: Phaser.GameObjects.Image | null;
    beardImage: Phaser.GameObjects.Image | null;
    glovesImage: Phaser.GameObjects.Image | null;
    bootsImage: Phaser.GameObjects.Image | null;
    hairImage: Phaser.GameObjects.Image | null;
    headImage: Phaser.GameObjects.Image | null;
    legsImage: Phaser.GameObjects.Image | null;
    userNameText: Phaser.GameObjects.Text | null;
    onSizeChange: (userAvatarContainer: UserAvatarContainer) => void = () => { };
    imageMultiplier: number = 10;
    tableRotation: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, user: User) {
        super(scene, x, y);
        this.user = user;
        this.loadUserAvatarImages();
        scene.load.on('complete', () => {
            this.loadUserAvatarImages();
        });
        this.cloakImage = null;
        this.bodyImage = null;
        this.baseImage = null;
        this.beardImage = null;
        this.glovesImage = null;
        this.bootsImage = null;
        this.hairImage = null;
        this.headImage = null;
        this.legsImage = null;
        this.userNameText = null;
        if (user.name) {
            this.userNameText = scene.add.text(0, 0, user.name, { fontSize: '50px' });
            this.userNameText.setOrigin(0.5, 4.5);
            this.userNameText.setStroke('#000', 4);
            this.add(this.userNameText);
        }
        this.setSize(0, 0);
    }

    public setUserName(name: string) {
        if (this.userNameText) {
            this.userNameText.setText(name);
        }
    }

    public loadUserAvatarImages() {
        if (!this.scene) return;
        const addImage = (image: string) => {
            if (!this.scene.textures.exists(image)) return null;
            const imageObject = this.scene.add.image(0, 0, image);
            imageObject.setScale(this.imageMultiplier);
            if (!imageObject) return null;
            this.add(imageObject);
            return imageObject;
        }
        // Hello
        const userId = this.user.id;
        if (!userId) return;
        if (this.cloakImage) this.cloakImage.destroy();
        this.cloakImage = addImage(`${userId}-cloak`);
        if (this.baseImage) this.baseImage.destroy();
        this.baseImage = addImage(`${userId}-base`);
        if (this.bodyImage) this.bodyImage.destroy();
        this.bodyImage = addImage(`${userId}-body`);
        if (this.beardImage) this.beardImage.destroy();
        this.beardImage = addImage(`${userId}-beard`);
        if (this.glovesImage) this.glovesImage.destroy();
        this.glovesImage = addImage(`${userId}-gloves`);
        if (this.bootsImage) this.bootsImage.destroy();
        this.bootsImage = addImage(`${userId}-boots`);
        if (this.hairImage) this.hairImage.destroy();
        this.hairImage = addImage(`${userId}-hair`);
        if (this.headImage) this.headImage.destroy();
        this.headImage = addImage(`${userId}-head`);
        if (this.legsImage) this.legsImage.destroy();
        this.legsImage = addImage(`${userId}-legs`);
        [this.cloakImage, this.baseImage, this.bodyImage, this.beardImage, this.glovesImage, this.bootsImage, this.hairImage, this.headImage, this.legsImage].reverse().forEach(image => {
            if (!image) return;
            this.sendToBack(image);
        });
        const width = (() => {
            if (!this.baseImage) return 0;
            return this.baseImage.width * this.imageMultiplier / 2.4;
        })();
        const height = (() => {
            if (!this.baseImage) return 0;
            return this.baseImage.height * this.imageMultiplier;
        })();
        this.setSize(width, height);
        if (this.onSizeChange) {
            this.onSizeChange(this);
        }
    }
}