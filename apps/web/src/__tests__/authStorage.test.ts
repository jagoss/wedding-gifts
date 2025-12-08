import { clearAuth, getStoredToken, getStoredUser, persistAuth } from "@/lib/auth-storage";

describe("auth-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("guarda y lee token y usuario", () => {
    persistAuth({ accessToken: "abc", user: { id: "1", name: "Jane", email: "a@b.com" } });
    expect(getStoredToken()).toBe("abc");
    expect(getStoredUser()).toMatchObject({ name: "Jane" });
  });

  it("limpia el estado", () => {
    persistAuth({ accessToken: "abc", user: { id: "1", name: "Jane", email: "a@b.com" } });
    clearAuth();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});

