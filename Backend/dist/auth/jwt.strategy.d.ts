import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    private static extractJWTFromCookie;
    validate(payload: any): Promise<{
        name: string;
        email: string;
        id: number;
        tipo: import("@prisma/client").$Enums.UserType;
    }>;
}
export {};
