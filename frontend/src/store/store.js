// store.js
import { configureStore } from '@reduxjs/toolkit';

// 1. Define initial state from localStorage or default
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

// 2. Create the user reducer
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

// 3. Create and export the store using Redux Toolkit
const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

export default store;