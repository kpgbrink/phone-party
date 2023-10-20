import { UserAvatar } from "../../../../shared/Types";
import { avatarImages } from "../../../PhaserPages/objects/avatarImages.generated";

interface UserAvatarImageProps {
  userAvatar: UserAvatar;
  type: string;
  imageStyle: React.CSSProperties;
}

function UserAvatarImageBase({
  userAvatar,
  type,
  imageStyle,
}: UserAvatarImageProps) {
  type AvatarImageKey = keyof typeof userAvatar;
  const objectKey = type as AvatarImageKey;
  const avatarImage = userAvatar[objectKey];
  if (avatarImage === -1) return null;

  type AvatarImagesKey = keyof typeof avatarImages;
  const avatarImagesKey = type as AvatarImagesKey;
  const avatarImagesObject = avatarImages[avatarImagesKey];
  const avatarImageName = avatarImagesObject[avatarImage];

  return (
    <img
      src={`/assets/player/${type}/${avatarImageName}`}
      alt={`user avatar ${type}`}
      style={imageStyle}
    />
  );
}

export default UserAvatarImageBase;
