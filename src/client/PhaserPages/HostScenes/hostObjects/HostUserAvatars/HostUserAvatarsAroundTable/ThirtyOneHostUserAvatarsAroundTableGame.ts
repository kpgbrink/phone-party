import { User } from "api";
import { ThirtyOneUserAvatarContainer } from "../../../../objects/userAvatarContainer/cardGameUserAvatarContainer/ThirtyOneUserAvatarContainer";
import { HostUserAvatarsAroundTableGame } from "./HostUserAvatarsAroundTableGame";


export default class ThirtyOneHostUserAvatarsAroundTableGame extends HostUserAvatarsAroundTableGame<ThirtyOneUserAvatarContainer> {

    getUsersInGame() {
        // only get users with lives still
        return this.userAvatarContainers.filter((userAvatar) => userAvatar.user.inGame).filter((userAvatar) => userAvatar.lives > 0);
    }

    override createUserAvatarContainer(x: number, y: number, user: User) {
        const userAvatarContainer = new ThirtyOneUserAvatarContainer(this.scene, x, y, user);
        return userAvatarContainer;
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}