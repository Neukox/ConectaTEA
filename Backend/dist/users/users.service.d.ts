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
        id: number;
        tipo: import("@prisma/client").$Enums.UserType;
    }[]>;
    findOne(id: number): Promise<{
        message: string;
        data: {
            name: string;
            email: string;
            id: number;
            telefone: string;
            endereco: string;
            tipo: import("@prisma/client").$Enums.UserType;
        };
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: {
            name: string;
            email: string;
            id: number;
            telefone: string;
            endereco: string;
            tipo: import("@prisma/client").$Enums.UserType;
        };
    }>;
    remove(id: number): Promise<{
        name: string;
        email: string | null;
        password: string;
        id: number;
        telefone: string | null;
        endereco: string | null;
        tipo: import("@prisma/client").$Enums.UserType;
        criado_em: Date;
    }>;
}
