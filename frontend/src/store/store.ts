import { configureStore } from '@reduxjs/toolkit';

// --- Type Definitions ---

export interface UserState {
    email: string;
    role: string;
    name: string;
}

interface SetUserAction {
    type: 'SET_USER';
    payload: {
        email: string;
        role?: string;
        name?: string;
    };
}

interface SetEmailAction {
    type: 'SET_EMAIL';
    payload: string;
}

interface LogoutAction {
    type: 'LOGOUT';
}

type UserAction = SetUserAction | SetEmailAction | LogoutAction;

// --- Initial State Setup ---

const savedUserStr = localStorage.getItem('shophub_user');
let savedUser: UserState | null = null;

try {
    if (savedUserStr) {
        savedUser = JSON.parse(savedUserStr) as UserState;
    }
} catch (e) {
    console.error("Failed to parse user from local storage", e);
}

const initialUserState: UserState = savedUser || {
    email: '',
    role: 'user',
    name: '',
};

// --- Reducer ---

const userReducer = (state: UserState = initialUserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'SET_USER': {
            const newState: UserState = {
                ...state,
                email: action.payload.email,
                role: action.payload.role || 'user',
                name: action.payload.name || '',
            };
            localStorage.setItem('shophub_user', JSON.stringify(newState));
            return newState;
        }
        case 'SET_EMAIL':
            return {
                ...state,
                email: action.payload,
            };
        case 'LOGOUT':
            localStorage.removeItem('shophub_user');
            return {
                email: '',
                role: 'user',
                name: '',
            };
        default:
            return state;
    }
};

// --- Store Configuration ---

const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;