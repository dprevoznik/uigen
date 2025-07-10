import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";
import { createSession, SessionPayload } from "@/lib/auth";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock dependencies
const mockCookies = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));

const mockSignJWTInstance = vi.hoisted(() => ({
  setProtectedHeader: vi.fn(),
  setExpirationTime: vi.fn(),
  setIssuedAt: vi.fn(),
  sign: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookies),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn(),
}));

describe("createSession", () => {
  let mockJWTInstance: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create a fresh mock instance for each test
    mockJWTInstance = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("mock-jwt-token"),
    };
    
    // Update the SignJWT mock to return our instance
    const { SignJWT } = vi.mocked(await import("jose"));
    SignJWT.mockImplementation(() => mockJWTInstance);
    
    // Update the cookies mock to return our mock
    const { cookies } = vi.mocked(await import("next/headers"));
    cookies.mockResolvedValue(mockCookies);
    
    // Mock environment
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("creates session with correct JWT payload", async () => {
    const userId = "user123";
    const email = "test@example.com";
    
    await createSession(userId, email);
    
    // Verify SignJWT was called with correct payload
    expect(mockJWTInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
    expect(mockJWTInstance.setExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockJWTInstance.setIssuedAt).toHaveBeenCalled();
    expect(mockJWTInstance.sign).toHaveBeenCalled();
    
    // Verify SignJWT constructor was called with session data
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0];
    expect(constructorCall).toMatchObject({
      userId,
      email,
      expiresAt: expect.any(Date),
    });
  });

  test("sets expiration date to 7 days from now", async () => {
    const now = new Date("2024-01-01T00:00:00Z");
    const expected7DaysLater = new Date("2024-01-08T00:00:00Z");
    
    vi.setSystemTime(now);
    
    await createSession("user123", "test@example.com");
    
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0];
    expect(constructorCall?.expiresAt).toEqual(expected7DaysLater);
  });

  test("sets cookie with correct security options in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const userId = "user123";
    const email = "test@example.com";
    
    await createSession(userId, email);
    
    expect(mockCookies.set).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expect.any(Date),
        path: "/",
      }
    );
  });

  test("sets cookie with correct security options in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const userId = "user123";
    const email = "test@example.com";
    
    await createSession(userId, email);
    
    expect(mockCookies.set).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        expires: expect.any(Date),
        path: "/",
      }
    );
  });

  test("handles special characters in email", async () => {
    const userId = "user123";
    const email = "user+test@example-domain.com";
    
    await createSession(userId, email);
    
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0];
    expect(constructorCall?.email).toBe(email);
  });

  test("handles long user IDs", async () => {
    const userId = "a".repeat(100);
    const email = "test@example.com";
    
    await createSession(userId, email);
    
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0];
    expect(constructorCall?.userId).toBe(userId);
  });

  test("uses JWT_SECRET from environment", async () => {
    vi.stubEnv("JWT_SECRET", "custom-secret-key");
    
    await createSession("user123", "test@example.com");
    
    // Verify sign was called with the encoded secret
    expect(mockJWTInstance.sign).toHaveBeenCalledWith(
      new TextEncoder().encode("custom-secret-key")
    );
  });

  test("falls back to development secret when JWT_SECRET not set", async () => {
    vi.stubEnv("JWT_SECRET", undefined);
    
    await createSession("user123", "test@example.com");
    
    expect(mockJWTInstance.sign).toHaveBeenCalledWith(
      new TextEncoder().encode("development-secret-key")
    );
  });

  test("handles JWT signing errors gracefully", async () => {
    mockJWTInstance.sign.mockRejectedValue(new Error("Signing failed"));
    
    await expect(createSession("user123", "test@example.com")).rejects.toThrow(
      "Signing failed"
    );
  });

  test("handles cookie setting errors gracefully", async () => {
    mockCookies.set.mockImplementation(() => {
      throw new Error("Cookie setting failed");
    });
    
    await expect(createSession("user123", "test@example.com")).rejects.toThrow(
      "Cookie setting failed"
    );
  });

  test("creates session with empty string values", async () => {
    const userId = "";
    const email = "";
    
    await createSession(userId, email);
    
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0];
    expect(constructorCall?.userId).toBe("");
    expect(constructorCall?.email).toBe("");
  });

  test("session payload includes all required fields", async () => {
    const userId = "user123";
    const email = "test@example.com";
    
    await createSession(userId, email);
    
    const { SignJWT } = await import("jose");
    const constructorCall = vi.mocked(SignJWT).mock.calls[0]?.[0] as unknown as SessionPayload;
    
    expect(constructorCall).toHaveProperty("userId");
    expect(constructorCall).toHaveProperty("email");
    expect(constructorCall).toHaveProperty("expiresAt");
    expect(constructorCall?.expiresAt).toBeInstanceOf(Date);
  });

  test("cookie expiration matches session expiration", async () => {
    const now = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(now);
    
    await createSession("user123", "test@example.com");
    
    const cookieCall = mockCookies.set.mock.calls[0];
    const cookieOptions = cookieCall[2];
    const expectedExpiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    expect(cookieOptions.expires).toEqual(expectedExpiration);
  });

  test("uses correct cookie name", async () => {
    await createSession("user123", "test@example.com");
    
    expect(mockCookies.set).toHaveBeenCalledWith(
      "auth-token",
      expect.any(String),
      expect.any(Object)
    );
  });

  test("sets correct JWT algorithm", async () => {
    await createSession("user123", "test@example.com");
    
    expect(mockJWTInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
  });

  test("sets correct JWT expiration time", async () => {
    await createSession("user123", "test@example.com");
    
    expect(mockJWTInstance.setExpirationTime).toHaveBeenCalledWith("7d");
  });

  test("sets JWT issued at timestamp", async () => {
    await createSession("user123", "test@example.com");
    
    expect(mockJWTInstance.setIssuedAt).toHaveBeenCalled();
  });
});