/*
Tests for the AuthService Class
*/
import { mock, instance, when, verify, anything, capture } from "@typestrong/ts-mockito";
import { AuthDao } from "../../src/dao/interfaces/AuthDao.js";
import { AuthService } from "../../src/service/AuthService.js";
import { DynamoDaoFactory } from "../../src/dao/dynamo/factory/DynamoDaoFactory.js";
import { AuthDto } from "@cookbook/shared";
import { createHash } from "node:crypto";

describe("AuthService", () => {
  const userId: string = "testUser";
  let mockAuthDao: AuthDao;
  let authService: AuthService;

  beforeEach(() => {
    const mockDaoFactory = mock<DynamoDaoFactory>();
    mockAuthDao = mock<AuthDao>();
    when(mockDaoFactory.getAuthDao()).thenReturn(instance(mockAuthDao));

    authService = new AuthService(instance(mockDaoFactory));
  });

  it("correctly creates a short term auth token", async () => {
    const authDto: AuthDto = await authService.createShortTermAuthToken(userId);

    verify(mockAuthDao.createAuthToken(anything())).once();
    expect(authDto.type).toEqual("short");
    expect(authDto.userId).toEqual(userId);

    const [authToken] = capture(mockAuthDao.createAuthToken).last();
    const { tokenId: userTokenId, rawToken: userRawToken } = splitUserAuthToken(authDto.authToken);

    expect(userTokenId).toEqual(authToken.tokenId);
    expect(hashToken(userRawToken ?? "")).toEqual(authToken.hashedToken);

    expect(authToken.revokedAt).toBeNull();
    expect(authToken.createdAt).toBeTruthy();
    expect(authToken.expiresAt).toBeTruthy();
    expect(authToken.ttlAt).toBeTruthy();
    expect(authToken.lastUsedAt).toBeTruthy();
  });

  it("correctly creates a long term auth token", async () => {
    const authDto: AuthDto = await authService.createLongTermAuthToken(userId);

    verify(mockAuthDao.createAuthToken(anything())).once();
    expect(authDto.type).toEqual("long");
    expect(authDto.userId).toEqual(userId);

    const [authToken] = capture(mockAuthDao.createAuthToken).last();
    const { tokenId: userTokenId, rawToken: userRawToken } = splitUserAuthToken(authDto.authToken);

    expect(userTokenId).toEqual(authToken.tokenId);
    expect(hashToken(userRawToken ?? "")).toEqual(authToken.hashedToken);

    expect(authToken.revokedAt).toBeNull();
    expect(authToken.createdAt).toBeTruthy();
    expect(authToken.expiresAt).toBeTruthy();
    expect(authToken.ttlAt).toBeTruthy();
    expect(authToken.lastUsedAt).toBeTruthy();
  });
});

const splitUserAuthToken = (
  userToken: string,
): { tokenId: string | undefined; rawToken: string | undefined } => {
  const [tokenId, rawToken] = userToken.split(".");
  return { tokenId, rawToken };
};

const hashToken = (rawToken: string): string => {
  return createHash("sha256").update(rawToken).digest("hex");
};
