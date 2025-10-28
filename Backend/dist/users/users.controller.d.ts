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
        id: number;
        tipo: import("@prisma/client").$Enums.UserType;
    }[]>;
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
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
    remove(id: string): Promise<{
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
