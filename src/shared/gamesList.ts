
// Make a list of the games
export interface IGame {
    name: string;
    displayName: string;
    description: string;
    image: string;

    // If someone is able to leave a game in the middle of a game
    leavable: boolean | null;
    // If game is joinable when the game is running
    joinable: boolean | null;

    minPlayers: number | null;
    maxPlayers: number | null;
    suggestedMinPlayers: number | null;
    suggestedMaxPlayers: number | null;
    // host scene types
    sceneOrder: string[];
}

export const getGameFromName = (gameName: string): IGame => {
    const game = gamesList.find((game) => {
        return game.name === gameName;
    });
    if (!game) {
        throw new Error(`Game ${gameName} not found`);
    }
    return game;
};

export const gamesList: IGame[] = [
    {
        name: 'Random',
        displayName: 'Random',
        description: 'Random game',
        image: 'Random',
        leavable: false,
        joinable: false,

        minPlayers: null,
        maxPlayers: null,
        suggestedMinPlayers: null,
        suggestedMaxPlayers: null,
        sceneOrder: [],
    },
    {
        name: 'ThirtyOne',
        displayName: 'Thirty One',
        description: 'A card game where you try to get the most points',
        image: 'https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400',
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [
            'HostBeforeTableGameScene',
            'ThirtyOneHostScene',
        ],
    },
    {
        name: 'Texas',
        displayName: 'Texas Holdem',
        description: 'A card game where you win money',
        image: 'https://lh3.googleusercontent.com/Gv5VoOo9teJl7b66BC5r67pdaHJmOufAhZUofR4SqCihvV72IKGatTwpf1GyyYzYHjEyoEFId60eGxLztcdo1PesdwQoRN-lu73U7nEr9noBxbIEEC0sgFu5OXHyhb7_42Kj_auZMgs=w2400',
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha',
        displayName: 'Omaha Poker',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha1',
        displayName: 'Omaha Poker1',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha2',
        displayName: 'Omaha Poker2',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha3',
        displayName: 'Omaha Poker3',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha4',
        displayName: 'Omaha Poker4',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: 'Omaha5',
        displayName: 'Omaha Poker5',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha6',
        displayName: 'Omaha Poker6',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha7',
        displayName: 'Omaha Poker7',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha8',
        displayName: 'Omaha Poker8',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha9',
        displayName: 'Omaha Poker9',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha10',
        displayName: 'Omaha Poker10',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: 'Omaha11',
        displayName: 'Omaha Poker11',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '12',
        displayName: 'Omaha 12',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '13',
        displayName: 'Omaha 13\n hdfsa fdshfads\n Tdsifosdhofdhfdoidfshi',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '14',
        displayName: 'Omaha 14',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '15',
        displayName: 'Omaha 15',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '16',
        displayName: 'Omaha 16',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '17',
        displayName: 'Omaha 17',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '18',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '19',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '20',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '21',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '22',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '23',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '24',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '25',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    }, {
        name: '26',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '27',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '28',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '29',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '30',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '31',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '32',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '33',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '34',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '35',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '36',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '37',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '38',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
    {
        name: '39',
        displayName: 'Omaha 18',
        description: 'A card game where you win money lots but with 4 cards this time.',
        image: "https://lh3.googleusercontent.com/ej5rMzqw1W_s5Zz5SrAGR_4iBB62hHwxWsNl9IbcLSBcbUp-bQz2MTwXinSkoqYw_hI8aBAZOXIdAUYL_0rM2raz5Z-gtI2BK1j6wMHCHZegZdCruJ4X_fc2M1oe8CXV2q9wGxbCfkg=w2400",
        leavable: false,
        joinable: false,
        minPlayers: 2,
        maxPlayers: 8,
        suggestedMinPlayers: 3,
        suggestedMaxPlayers: 5,
        sceneOrder: [],
    },
];