// store.js
import { configureStore } from '@reduxjs/toolkit';

interface UserState {
    email: string;
    role: string;
    name: string;
}

interface Action {
    type: string;
    payload?: any;
}

const savedUserStr = localStorage.getItem('shophub_user');
let savedUser: UserState | null = null;
try {
    if (savedUserStr) savedUser = JSON.parse(savedUserStr);
} catch (e) { }

const initialUserState: UserState = savedUser || {
    email: '',
    role: 'user',
    name: '',
};

const userReducer = (state = initialUserState, action: Action) => {
    switch (action.type) {
        case 'SET_USER': {
            const newState = {
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

const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;