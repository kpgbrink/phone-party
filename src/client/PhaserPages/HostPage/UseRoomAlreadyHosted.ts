import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../SocketConnection';

export const useRoomAlreadyHosted = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleRoomAlreadyHosted = () => {
            console.log('room already hosted');
            navigate('/');
        };

        socket.on('room already hosted', handleRoomAlreadyHosted);

        return () => {
            socket.off('room already hosted', handleRoomAlreadyHosted);
        };
    }, [navigate]);
};
