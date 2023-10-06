import { User } from "api";
import UserAvatarContainer from "../../../../objects/UserAvatarContainer";
import { BeforeTableGameUserAvatarContainer } from "../../../../objects/userAvatarContainer/BeforeTableGameUserAvatarContainer";
import { HostUserAvatarsAroundTable } from "../HostUserAvatarsAroundTable";

export class HostUserAvatarsAroundTableSelectPosition extends HostUserAvatarsAroundTable<BeforeTableGameUserAvatarContainer> {
    moveToEdgeOfTableSpeed: number = 5;

    override createUserAvatarContainer(x: number, y: number, user: User): BeforeTableGameUserAvatarContainer {
        const userAvatarContainer = new BeforeTableGameUserAvatarContainer(this.scene, x, y, user);
        return userAvatarContainer;
    }

    override afterUserAvatarCreated(userAvatarContainer: UserAvatarContainer): void {
        super.afterUserAvatarCreated(userAvatarContainer);
        userAvatarContainer.onSizeChange = (userAvatarContainer: UserAvatarContainer) => {

        };
    }

}