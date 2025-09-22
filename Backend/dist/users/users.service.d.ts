import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            tipo: import("@prisma/client").$Enums.UserType;
        };
    }>;
    findAll(): Promise<{
        name: string;
        email: string;
        tipo: import("@prisma/client").$Enums.UserType;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        message: string;
        data: {
            name: string;
            email: string;
            telefone: string;
            endereco: string;
            tipo: import("@prisma/client").$Enums.UserType;
            id: number;
        };
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: {
            name: string;
            email: string;
            telefone: string;
            endereco: string;
            tipo: import("@prisma/client").$Enums.UserType;
            id: number;
        };
    }>;
    remove(id: number): Promise<{
        name: string;
        email: string | null;
        password: string;
        telefone: string | null;
        endereco: string | null;
        tipo: import("@prisma/client").$Enums.UserType;
        criado_em: Date;
        id: number;
    }>;
}
