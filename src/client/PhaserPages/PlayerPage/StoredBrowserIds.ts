import { StoredBrowserIds } from "api";


export const storeIds = (socketId: string, userId: string) => {
    localStorage.setItem('socketId', socketId);
    localStorage.setItem('userId', userId);
    sessionStorage.setItem('socketId', socketId);
    sessionStorage.setItem('userId', userId);
};

export const getStoredIds = (): StoredBrowserIds => {
    const localStorageSocketId = localStorage.getItem('socketId');
    const localStorageUserId = localStorage.getItem('userId');
    const sessionStorageSocketId = sessionStorage.getItem('socketId');
    const sessionStorageUserId = sessionStorage.getItem('userId');
    return {
        localStorage: {
            socketId: localStorageSocketId,
            userId: localStorageUserId
        }, sessionStorage: {
            socketId: sessionStorageSocketId,
            userId: sessionStorageUserId
        }
    };
};
