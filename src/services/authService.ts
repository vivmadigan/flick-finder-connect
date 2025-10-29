import { API_MODE, API_BASE, TOKEN_KEY } from "./apiMode";
import type { SignUpDto, SignInDto, AuthResponse, MyInformationDto } from "@/types/auth";

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const authService = {
  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    if (API_MODE === "mock") {
      await delay(500);
      // TODO: remove mock logic when switching to LIVE mode (set VITE_API_MODE=live)
      return {
        token: "MOCK_TOKEN",
        userId: "mock-user-id-123",
        email: dto.email,
        displayName: dto.displayName
      };
    }
    // TODO: LIVE mode - calls real ASP.NET backend /api/SignUp
    const res = await fetch(`${API_BASE}/api/SignUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `SignUp failed with status ${res.status}`);
    }
    return res.json();
  },

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    console.log('[authService] signIn called with:', { email: dto.email });
    console.log('[authService] API_MODE:', API_MODE);
    console.log('[authService] API_BASE:', API_BASE);
    
    if (API_MODE === "mock") {
      await delay(400);
      // TODO: remove mock logic when switching to LIVE mode
      return {
        token: "MOCK_TOKEN",
        userId: "mock-user-id-123",
        email: dto.email,
        displayName: "mockDisplay"
      };
    }
    // TODO: LIVE mode - calls real ASP.NET backend /api/SignIn
    console.log('[authService] Making fetch request to:', `${API_BASE}/api/SignIn`);
    const res = await fetch(`${API_BASE}/api/SignIn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });
    console.log('[authService] Response status:', res.status);
    console.log('[authService] Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[authService] Error response:', errorText);
      throw new Error(errorText || `SignIn failed with status ${res.status}`);
    }
    const data = await res.json();
    console.log('[authService] Response data:', data);
    return data;
  },

  async myInformation(): Promise<MyInformationDto> {
    if (API_MODE === "mock") {
      await delay(300);
      // TODO: remove mock logic when switching to LIVE mode
      return {
        userId: "mock-user-id-123",
        email: "mock@example.com",
        firstName: "Mock",
        lastName: "User",
        displayName: "mockDisplay"
      };
    }
    // TODO: LIVE mode - calls real ASP.NET backend /api/MyInformation with Bearer token
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${API_BASE}/api/MyInformation`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `MyInformation failed with status ${res.status}`);
    }
    return res.json();
  }
};

// Tiny helpers
export function saveToken(token: string) { 
  localStorage.setItem(TOKEN_KEY, token); 
}

export function clearToken() { 
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("cinematch_user");
  localStorage.removeItem("cinematch_preferences");
  localStorage.removeItem("cinematch_liked_movies");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
