import React from "react";
import { Socket } from "socket.io-client";
import { User } from "../shared/Types";
import socket from "./SocketConnection";

interface AppContextInterface {
  roomJoined: string | null;
  setRoomJoined: React.Dispatch<React.SetStateAction<string | null>>;
  roomCreated: string | null;
  setRoomCreated: React.Dispatch<React.SetStateAction<string | null>>;
  userList: User[];
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
  socket: Socket;
}
// type UpdateType = React.Dispatch<React.SetStateAction<typeof defaultValue>>;
export const AppContext = React.createContext<AppContextInterface>({
  roomJoined: null,
  setRoomJoined: () => {},
  roomCreated: null,
  setRoomCreated: () => {},
  userList: [],
  setUserList: () => {},
  socket: socket,
});

// Provider in your app
export const AppContextProvider = (props: React.PropsWithChildren<object>) => {
  const [roomJoined, setRoomJoined] = React.useState<string | null>(null);
  const [roomCreated, setRoomCreated] = React.useState<string | null>(null);
  const [userList, setUserList] = React.useState<User[]>([]);

  return (
    <AppContext.Provider
      value={{
        roomJoined,
        setRoomJoined,
        roomCreated,
        setRoomCreated,
        userList,
        setUserList,
        socket: socket,
      }}
      {...props}
    />
  );
};
