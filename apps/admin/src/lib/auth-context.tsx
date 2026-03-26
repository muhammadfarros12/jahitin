import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { Role, User } from "@/types";
import { apiClient } from "@/utils/api";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const verifySession = async () => {
			const savedToken = localStorage.getItem("token");

			if (!savedToken) {
				setIsLoading(false);
				return;
			}

			try {
				const res = await apiClient.api.user.profile.$get(
					{},
					{
						headers: { Authorization: `Bearer ${savedToken}` },
					},
				);

				if (res.ok) {
					const data = (await res.json()) as User;
					const user: User = {
						id: data.id,
						name: data.name,
						email: data.email,
						role: data.role,
					};
					setUser(user);
					setToken(savedToken);
					localStorage.setItem("jahitin_user", JSON.stringify(user));
				} else {
					localStorage.removeItem("token");
					localStorage.removeItem("jahitin_user");
				}
			} catch (error) {
				console.error("Session verification failed:", error);
				localStorage.removeItem("token");
				localStorage.removeItem("jahitin_user");
			} finally {
				setIsLoading(false);
			}
		};

		verifySession();
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const res = await apiClient.api.login.$post({
				json: { email, password },
			});
			if (!res.ok) return false;
			const data = (await res.json()) as {
				data: {
					id: number;
					username?: string;
					name?: string;
					email: string;
					role: Role;
				};
				token: string;
			};
			const u: User = {
				id: data.data.id,
				name: data.data.username ?? data.data.name ?? email.split("@")[0],
				email: data.data.email,
				role: data.data.role,
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
			value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const c = useContext(AuthContext);
	if (!c) throw new Error("useAuth must be used within AuthProvider");
	return c;
};
