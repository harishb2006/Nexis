// --- Type Definitions ---

export interface UserPayload {
    email: string;
    role?: string;
    name?: string;
}

// --- Actions ---

export const setemail = (email: string) => ({
    type: 'SET_EMAIL' as const,
    payload: email,
});

export const setUser = (user: UserPayload) => ({
    type: 'SET_USER' as const,
    payload: {
        email: user.email,
        role: user.role,
        name: user.name,
    },
});

export const logout = () => ({
    type: 'LOGOUT' as const,
});

// --- Action Types (Optional: for use in your reducer) ---
export type UserActionTypes = 
    | ReturnType<typeof setemail>
    | ReturnType<typeof setUser>
    | ReturnType<typeof logout>;