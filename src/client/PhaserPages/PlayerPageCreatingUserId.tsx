import { LinearProgress } from "@mui/material";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../AppContext";
import { persistentData } from "./objects/PersistantData";
import ShowRoomIssue from "./PlayerPage/ShowRoomIssue";
import ShowUserReplaceOptions from "./PlayerPage/ShowUserReplaceOptions";
import { getStoredIds, storeIds } from "./PlayerPage/StoredBrowserIds";

export default function PlayerPageCreatingUserId() {
  const { socket } = useContext(AppContext);
  const { roomId, userId } = useParams();
  const navigate = useNavigate();

  // add listener to get the user id
  useEffect(() => {
    const listener = (newUserId: string) => {
      storeIds(socket.id, newUserId);
      persistentData.myUserId = newUserId;
      navigate(`/room/${roomId}/player/${newUserId}`);
    };
    socket.on("user id", listener);
    socket.emit("join room", roomId, null, getStoredIds());
    return () => {
      socket.off("user id", listener);
    };
  }, [navigate, socket, roomId]);

  return (
    <>
      <LinearProgress />
      <ShowRoomIssue />
      <ShowUserReplaceOptions />
    </>
  );
}
