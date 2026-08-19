export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Session {
  id: string;
  device?: string;
  ip?: string;
  lastActive?: string;
  isCurrentSession?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  sessions: Session[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
