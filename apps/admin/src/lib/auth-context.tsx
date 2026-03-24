"use client";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { User } from "@/types";
import { apiClient } from "@/utils/api";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const savedUser = localStorage.getItem("jahitin_user");
		const savedToken = localStorage.getItem("token");
		if (savedUser && savedToken) {
			setUser(JSON.parse(savedUser));
			setToken(savedToken);
		}
		setIsInitialized(true);
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const res = await apiClient.api.login.$post({
				json: { email, password },
			});
			if (!res.ok) return false;
			const data = (await res.json()) as {
				data: { id: number; username?: string; name?: string; email: string };
				token: string;
			};
			const u: User = {
				id: data.data.id,
				name: data.data.username ?? data.data.name ?? email.split("@")[0],
				email: data.data.email,
			};
			setUser(u);
			setToken(data.token);
			localStorage.setItem("jahitin_user", JSON.stringify(u));
			localStorage.setItem("token", data.token);
			return true;
		} catch {
			return false;
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("jahitin_user");
		localStorage.removeItem("token");
	};

	return (
		<AuthContext.Provider
			value={{ user, token, login, logout, isAuthenticated: !!user }}
		>
			{isInitialized ? (
				children
			) : (
				<div className="min-h-screen bg-background" />
			)}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const c = useContext(AuthContext);
	if (!c) throw new Error("useAuth must be used within AuthProvider");
	return c;
};
