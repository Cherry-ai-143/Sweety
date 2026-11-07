import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    registerUser,
    getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem("sweety_token")
    );
    const [loading, setLoading] = useState(true);

    // Restore the logged-in user's session.
    useEffect(() => {
        async function restoreSession() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await getCurrentUser(token);
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem("sweety_token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, [token]);

    // Register a new user.
    async function register(name, email, password) {
        const response = await registerUser({
            name,
            email,
            password,
        });

        const { user, token } = response.data;

        localStorage.setItem("sweety_token", token);
        setToken(token);
        setUser(user);

        return response;
    }

    // Login an existing user.
    async function login(email, password) {
        const response = await loginUser({
            email,
            password,
        });

        const { user, token } = response.data;

        localStorage.setItem("sweety_token", token);
        setToken(token);
        setUser(user);

        return response;
    }

    // Logout the current user.
    function logout() {
        localStorage.removeItem("sweety_token");
        setToken(null);
        setUser(null);
    }

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: Boolean(token && user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to access authentication.
export function useAuth() {
    return useContext(AuthContext);
}