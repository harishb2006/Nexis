// store.js
import { configureStore } from '@reduxjs/toolkit';

const savedUserStr = localStorage.getItem('shophub_user');
let savedUser = null;
try {
    if (savedUserStr) savedUser = JSON.parse(savedUserStr);
} catch (e) { }

const initialUserState = savedUser || {
    email: '',
    role: 'user',
    name: '',
};

const userReducer = (state = initialUserState, action) => {
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

export default store;