// userActions.js
export const setemail = (email) => ({
    type: 'SET_EMAIL',
    payload: email,
});

export const setUser = (user) => ({
    type: 'SET_USER',
    payload: {
        email: user.email,
        role: user.role,
        name: user.name,
    },
});

export const logout = () => ({
    type: 'LOGOUT',
});