import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Mantém compatibilidade com headers
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "conectatea-secret-key",
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && "jwt" in req.cookies && req.cookies.jwt.length > 0) {
      return req.cookies.jwt;
    }
    return null;
  }

  async validate(payload: any) {
    return await this.authService.validateUser(payload.userId);
  }
}
