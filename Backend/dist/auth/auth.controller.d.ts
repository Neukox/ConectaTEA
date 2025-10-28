import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(request: any): Promise<{
        user: any;
    }>;
}
