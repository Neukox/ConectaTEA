import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
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
    remove(id: string): Promise<{
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
