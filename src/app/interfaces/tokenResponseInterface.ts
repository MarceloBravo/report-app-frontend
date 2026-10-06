export interface TokenResponseInterface {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    expiresIn: number,
    refreshExpiresIn: number
}