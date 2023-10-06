import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Game, RoomData, UserAvatar } from "api";
import { useContext, useEffect } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { Textfit } from "../../../Textfit";
import { AppContext } from "../../../AppContext";
import { palletColors } from "../../../Palettes";
import { avatarImages } from "../../../PhaserPages/objects/avatarImages.generated";
import { persistentData } from "../../../PhaserPages/objects/PersistantData";
import { useHostConnections } from "../../../WebRTC/HostConnections";

export default function HostPlayerJoin() {
  const { roomId } = useParams();
  const { roomCreated, userList, setUserList, socket } = useContext(AppContext);

  useHostConnections();

  // Get room data
  useEffect(() => {
    // The socket is a module that exports the actual socket.io socket
    const roomDataListener = (roomData: RoomData) => {
      if (!roomData?.users) return;
      persistentData.roomData = roomData;
      setUserList(roomData.users);
    };
    socket.on("room data", roomDataListener);
    // close socket on unmount
    return () => {
      socket.off("room data", roomDataListener);
    };
  }, [setUserList, roomId, socket]);

  useEffect(() => {
    const updateGame: Game = {
      currentPlayerScene: "PlayerStartingScene",
      selectedGameSceneIndex: 0,
      selectedGameName: null,
    };
    socket.emit("update game", updateGame);
  }, [roomId, socket]);

  const joinURL = `${window.location.origin}/room/${roomCreated}/player`;

  // add dummy users for testing
  for (let i = 0; i < 0; i++) {
    userList.push({
      id: "dummy" + i,
      socketId: "dummy" + i,
      userColor: "red",
      name: `Player ${i}`,
      room: "dummy",
      userAvatar: null,
      rotation: 0,
      inGame: false,
      hasSetName: false,
    });
  }

  return (
    <div id="playerJoin">
      {/* <a href={joinURL} target="_blank" rel="noreferrer">
        {joinURL}
      </a> */}
      <Textfit
        style={{
          position: "absolute",
          top: "4%",
          width: "100%",
          height: "15%",
          textAlign: "center",
          color: "black",
        }}>
        Phone Party
      </Textfit>

      <a href={joinURL} target="_blank" rel="noreferrer">
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "2%",
            height: "65%",
          }}>
          <QRCode
            // size={256}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "grey",
            }}
            value={joinURL}
            viewBox={`0 0 256 256`}
          />
        </div>
      </a>
      <div
        id="playerList"
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
          height: "65%",
          width: "58%",
          backgroundColor: palletColors.color1,
          padding: ".2%",
          borderRadius: "10px",
        }}>
        {userList.length === 0 && (
          <Textfit
            style={{
              height: "80%",
              width: "100%",
            }}>
            Waiting for players to scan...
          </Textfit>
        )}
        {userList.length > 0 && (
          <List
            style={{
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
              flexFlow: "column wrap",
            }}>
            {userList.map((user, index) => {
              return (
                <ListItem
                  key={index}
                  style={{
                    backgroundColor: palletColors.color3,
                    margin: ".2%",
                    borderRadius: "5px",
                    width: "47%",
                    height: "4vh",
                  }}>
                  {/* Add user avatar image here */}
                  {user.userAvatar && (
                    <UserAvatarImages userAvatar={user.userAvatar} />
                  )}
                  <Textfit
                    style={{
                      paddingLeft: "15%",
                      width: "100%",
                      height: "90%",
                    }}>
                    {user.name}
                  </Textfit>
                </ListItem>
              );
            })}
          </List>
        )}
      </div>
      {userList.length > 0 && (
        <Textfit
          id="playerSelectGameText"
          style={{
            position: "absolute",
            top: "87%",
            width: "100%",
            height: "9%",
            textAlign: "center",
            color: palletColors.color4,
            fontWeight: "bold",
          }}>
          Press Select Game to start!
        </Textfit>
      )}
    </div>
  );
}

// Avatar Images
// -----------------------------------

function UserAvatarImages({ userAvatar }: { userAvatar: UserAvatar }) {
  return (
    <>
      <UserAvatarImage userAvatar={userAvatar} type="cloak" />
      <UserAvatarImage userAvatar={userAvatar} type="base" />
      <UserAvatarImage userAvatar={userAvatar} type="body" />
      <UserAvatarImage userAvatar={userAvatar} type="beard" />
      <UserAvatarImage userAvatar={userAvatar} type="gloves" />
      <UserAvatarImage userAvatar={userAvatar} type="boots" />
      <UserAvatarImage userAvatar={userAvatar} type="hair" />
      <UserAvatarImage userAvatar={userAvatar} type="head" />
      <UserAvatarImage userAvatar={userAvatar} type="legs" />
    </>
  );
}

function UserAvatarImage({
  userAvatar,
  type,
}: {
  userAvatar: UserAvatar;
  type: string;
}) {
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
      src={`${process.env.PUBLIC_URL}/assets/player/${type}/${avatarImageName}`}
      alt={`user avatar ${type}`}
      style={{
        top: "-6%",
        left: "-5%",
        position: "absolute",
        height: "125%",
        width: "auto",
        borderRadius: "5px",
      }}
    />
  );
}
