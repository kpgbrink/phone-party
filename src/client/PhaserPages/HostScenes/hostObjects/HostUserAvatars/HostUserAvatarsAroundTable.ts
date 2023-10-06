import { angleFromPositionToPosition, distanceBetweenTwoPoints, getScreenCenter, keepAnglePositive, vectorFromAngleAndLength } from "../../../objects/Tools";
import UserAvatarContainer from "../../../objects/UserAvatarContainer";
import { calculateDistanceAndRotationFromTable } from "../../hostTools/HostTools";
import { HostUserAvatars } from "../HostUserAvatars";



export abstract class HostUserAvatarsAroundTable<UserAvatarContainerType extends UserAvatarContainer> extends HostUserAvatars<UserAvatarContainerType> {
    moveToEdgeOfTableSpeed: number = 8;

    moveToEdgeOfTable() {
        const screenCenter = getScreenCenter(this.scene);
        // Move all users to their correct position
        this.userAvatarContainers.forEach((userAvatar) => {
            // calculate distance from center
            const distanceFromCenter = distanceBetweenTwoPoints(userAvatar, screenCenter);

            // calculate angle from center to user avatar
            const angleFromCenterToUserAvatar = angleFromPositionToPosition(screenCenter, { x: userAvatar.x, y: userAvatar.y });

            // Calculate max distance
            const { maxDistance, positionAngle } = calculateDistanceAndRotationFromTable(this.scene, { x: userAvatar.x, y: userAvatar.y });
            // increase distance from center to make it to the outside of circle
            const distanceFromCenterToOutside = Math.min(distanceFromCenter + this.moveToEdgeOfTableSpeed, maxDistance);
            // calculate new x and y position
            const vectorFromCenter = vectorFromAngleAndLength(angleFromCenterToUserAvatar, distanceFromCenterToOutside);
            const newX = screenCenter.x + vectorFromCenter.x;
            const newY = screenCenter.y + vectorFromCenter.y;
            // move user avatar to new position
            userAvatar.x = newX;
            userAvatar.y = newY;
            userAvatar.tableRotation = keepAnglePositive(angleFromCenterToUserAvatar);
            // rotate user avatar to face the center
            userAvatar.rotation = positionAngle;
        });
    }

    override afterUserAvatarCreated(userAvatarContainer: UserAvatarContainer): void {
        super.afterUserAvatarCreated(userAvatarContainer);
        const user = userAvatarContainer.user;
        const screenCenter = getScreenCenter(this.scene);
        // if the rotation is already set move avatar to corrrect position
        if (user.rotation) {
            userAvatarContainer.x = screenCenter.x + (2000 * Math.cos(user.rotation));
            userAvatarContainer.y = screenCenter.y + (2000 * Math.sin(user.rotation));
        }

    }
}