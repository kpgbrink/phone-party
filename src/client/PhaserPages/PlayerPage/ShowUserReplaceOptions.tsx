import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
} from "@mui/material";
import { RoomData } from "api";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import socket from "../../SocketConnection";

export default function ShowUserReplaceOptions() {
  const [open, setOpen] = useState(false);
  const [usersToReplace, setUsersToReplace] = useState<string[]>([]);
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState<RoomData>();

  useEffect(() => {
    const listener = (usersToReplaceData: string[]) => {
      setOpen(true);
      setUsersToReplace(usersToReplaceData);
    };
    socket.on("users to replace", listener);
    return () => {
      socket.off("room does not exist", listener);
    };
  }, [open, usersToReplace]);

  useEffect(() => {
    const listener = (roomData: RoomData) => {
      setRoomData(roomData);
    };
    socket.on("room data", listener);
    socket.emit("get room data");
    return () => {
      socket.off("room data", listener);
    };
  }, []);

  // auto choose on the server of the userId thing based on the local data of the user.

  return (
    <>
      {/* <Button onClick={() => setOpen(true)}>Open dialog</Button> */}
      <Dialog open={open}>
        <DialogTitle>Select User to Replace</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Multiple users left the game in progress. Please choose who you
            were.
          </DialogContentText>
          <List>
            {usersToReplace.map((userId) => (
              <ListItem>
                <NavLink
                  key={userId}
                  to={`/room/${roomId}/player/${userId}`}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {roomData?.users.find((user) => user.id === userId)?.name ??
                    userId}
                </NavLink>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
