import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto, response: Response): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            tipo: import("@prisma/client").$Enums.UserType;
        };
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    validateUser(userId: number): Promise<{
        name: string;
        email: string;
        id: number;
        tipo: import("@prisma/client").$Enums.UserType;
    }>;
}
