// store.js
import { configureStore } from '@reduxjs/toolkit';
 
// 1. Define initial state for user
const initialUserState = {
    email: '',
    role: 'user',
    name: '',
};

// 2. Create the user reducer
const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                email: action.payload.email,
                role: action.payload.role || 'user',
                name: action.payload.name || '',
            };
        case 'SET_EMAIL':
            return {
                ...state,
                email: action.payload,
            };
        case 'LOGOUT':
            return initialUserState;
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