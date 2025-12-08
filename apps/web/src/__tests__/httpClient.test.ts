import { HttpClient } from "@/core/infrastructure/http/httpClient";

describe("HttpClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envía Authorization cuando hay token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ hello: "world" })
    });
    // @ts-expect-error override global
    global.fetch = fetchMock;

    const client = new HttpClient({ baseUrl: "http://api", getAccessToken: () => "token-123" });
    await client.get("/hello");

    expect(fetchMock).toHaveBeenCalledWith("http://api/hello", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer token-123" })
    }));
  });

  it("lanza error con payload de API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: { code: "NOT_FOUND", message: "Missing" } })
    });
    // @ts-expect-error override global
    global.fetch = fetchMock;

    const client = new HttpClient({ baseUrl: "http://api" });
    await expect(client.get("/missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Missing"
    });
  });
});

