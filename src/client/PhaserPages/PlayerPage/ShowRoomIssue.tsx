import { Button } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../SocketConnection";
import { getStoredIds } from "./StoredBrowserIds";

export default function ShowRoomIssue() {
  const { roomId, userId } = useParams();

  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  useEffect(() => {
    const listener = (title: string, description: string) => {
      setOpen(true);
      setDialogTitle(title);
      setDialogContent(description);
      // retry to join the room after a few seconds
      setTimeout(() => {
        socket.emit("join room", roomId, userId, getStoredIds());
      }, 2000);
    };
    socket.on("room issue", listener);
    return () => {
      socket.off("room issue", listener);
    };
  }, [setOpen, setDialogTitle, setDialogContent, roomId, userId]);

  return (
    <>
      {/* <Button onClick={() => setOpen(true)}>Open dialog</Button> */}
      <Dialog open={open}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
