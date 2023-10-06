import { RoomData, User } from "api";
import { persistentData } from "../../objects/PersistantData";
import { getScreenCenter, randomNumberBetween } from "../../objects/Tools";
import UserAvatarContainer from "../../objects/UserAvatarContainer";

export abstract class HostUserAvatars<UserAvatarContainerType extends UserAvatarContainer>{
    scene: Phaser.Scene;
    userAvatarContainers: UserAvatarContainerType[] = [];

    onSizeChange: (userAvatarContainer: UserAvatarContainerType) => void = () => { };

    constructor(
        scene: Phaser.Scene,
    ) {
        this.scene = scene;
    }

    createOnRoomData() {
        this.createUsers(persistentData.roomData);
    }

    abstract createUserAvatarContainer(x: number, y: number, user: User): UserAvatarContainerType;

    createUsers(roomData: RoomData | null) {
        if (roomData === null) return;
        // Create a user avatar for each user
        roomData?.users.forEach((user) => {
            if (!user.userAvatar) return;
            // Don't recreate a user avatar if it already exists
            if (this.userAvatarContainers.find((userAvatar) => userAvatar.user.id === user.id)) return;
            const screenCenter = getScreenCenter(this.scene);
            // const userAvatarContainer = new UserAvatarContainer(this.scene, screenCenter.x + Math.random() - .5, screenCenter.y + Math.random() - .5, user);
            const userAvatarContainer = this.createUserAvatarContainer(screenCenter.x + Math.random() - .5, screenCenter.y + Math.random() - .5, user);
            this.afterUserAvatarCreated(userAvatarContainer);
            this.scene.add.existing(userAvatarContainer);
            this.userAvatarContainers.push(userAvatarContainer);
        });
        // Remove any user avatars that are no longer in the room
        this.userAvatarContainers.forEach((userAvatar) => {
            if (roomData?.users.find((user) => user.id === userAvatar.user.id)) return;
            userAvatar.destroy();
            this.userAvatarContainers.splice(this.userAvatarContainers.indexOf(userAvatar), 1);
        });
    }

    afterUserAvatarCreated(userAvatarContainer: UserAvatarContainer): void {

    }

    setDepth(depth: number) {
        this.userAvatarContainers.forEach((userAvatar) => {
            userAvatar.setDepth(depth);
        });
    }

    getUsersInGame() {
        return this.userAvatarContainers.filter((userAvatar) => userAvatar.user.inGame);
    }

    getUserById(userId: string) {
        return this.userAvatarContainers.find((userAvatar) => userAvatar.user.id === userId);
    }

    getRandomUserIdInGame() {
        return this.getUsersInGame()[randomNumberBetween(0, this.getUsersInGame().length - 1)]?.user.id;
    }

    getNextUserIdFromRotationInGame(userId: string) {
        // order users by rotation
        // make sure that the userId is in the list even though if not in game
        const usersInGame = this.getUsersInGame();
        if (!usersInGame.find((userAvatar) => userAvatar.user.id === userId)) {
            const currentUser = this.getUserById(userId);
            if (!currentUser) { throw new Error(`User ${userId} not found`); }
            usersInGame.push(currentUser);
        }
        const users = usersInGame.sort((a, b) => a.rotation - b.rotation);
        // find the next user from the current dealer`
        const currentUserIndex = users.findIndex(u => u.user.id === userId);
        if (currentUserIndex === -1) {
            throw new Error(`User ${userId} not found in userAvatarContainers`);
        }
        const nextUserIndex = (currentUserIndex + 1) % users.length;
        return users[nextUserIndex].user.id;
    }

    update(time: number, delta: number) {
        this.userAvatarContainers.forEach((userAvatar) => {
            userAvatar.update(time, delta);
        });
    }
}