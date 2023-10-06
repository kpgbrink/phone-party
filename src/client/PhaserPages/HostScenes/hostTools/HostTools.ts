import { tableDimensions } from "../../objects/GameTable";
import { distanceBetweenTwoPoints, getAverageRadians, getScreenCenter, Position, pow2, quadraticFormula } from "../../objects/Tools";

export const calculateDistanceAndRotationFromTable = (scene: Phaser.Scene, position: Position) => {
    const screenCenter = getScreenCenter(scene);
    // calculate angle from center to user avatar
    const angleFromCenterToposition = Math.atan2(position.y - screenCenter.y, position.x - screenCenter.x);

    const tableHalfHeight = tableDimensions.height / 2;
    const tableHalfWidth = tableDimensions.width / 2;
    const tableHalfOvalWidth = tableDimensions.ovalWidth / 2;
    // Calculate max distance
    const distanceSideWall = Math.abs(tableHalfWidth / Math.cos(angleFromCenterToposition));
    const distanceTopWall = Math.abs(tableHalfHeight / Math.sin(angleFromCenterToposition));
    if (distanceTopWall < distanceSideWall) {
        // Check if the user avatar is in the top or bottom half of the table
        // User avatar is in the top half of the table
        const facingStraightDownDirection = (() => {
            if (position.y > screenCenter.y) {
                return Math.PI / 2;
            }
            return -Math.PI / 2;
        })();

        return {
            maxDistance: distanceTopWall,
            positionAngle: getAverageRadians([angleFromCenterToposition, facingStraightDownDirection, facingStraightDownDirection]) - Math.PI / 2
        };
    }
    // calculate height from hypotenuse and adjacent
    const heightOpposite = Math.sqrt(Math.abs(Math.pow(distanceSideWall, 2) - Math.pow(tableHalfWidth, 2)));

    // add distance of the circle at the height
    const a = pow2(Math.tan(angleFromCenterToposition)) + ((1 / 4) * pow2(tableDimensions.height)) / pow2(tableHalfOvalWidth);
    const b = 2 * heightOpposite * Math.tan(angleFromCenterToposition);
    const c = pow2(heightOpposite) - 1 / 4 * pow2(tableDimensions.height);
    const xLocations = quadraticFormula(a, b, c);
    const equation = (x: number) => {
        return Math.tan(angleFromCenterToposition) * x + heightOpposite;
    }
    const getDistance = (x: number) => {
        const y = equation(x);
        const distance = distanceBetweenTwoPoints({ x, y }, { x: 0, y: heightOpposite });
        return distance;
    };
    let lowestDistance = Infinity;
    let lowestX = 0;
    xLocations.forEach((x) => {
        const distance = getDistance(x);
        if (distance < lowestDistance) {
            lowestDistance = distance;
            lowestX = x;
        }
    });
    const lowestY = equation(lowestX);
    // angle to lowest point
    const angleToLowestPoint = (() => {
        const angle = Math.atan2(lowestY, lowestX);
        if (angleFromCenterToposition < 0) {
            return angle + Math.PI;
        }
        return angle;
    })();
    // Fix angle being backwards
    return { maxDistance: distanceSideWall + lowestDistance, positionAngle: getAverageRadians([angleToLowestPoint, angleToLowestPoint, angleFromCenterToposition]) - Math.PI / 2 };
}


