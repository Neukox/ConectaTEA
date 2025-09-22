import { PrismaService } from '../prisma/prisma.service';
import { CreateCriancaDto } from './dto/create-crianca.dto';
import { UpdateCriancaDto } from './dto/update-crianca.dto';
export declare class CriancasService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCriancaDto: CreateCriancaDto, userId?: number): Promise<{
        message: string;
        crianca: {
            id: number;
            nome: string;
            idade: number;
            dataDeNascimento: Date;
            genero: string;
            diagnostico: string;
            parentesco: import("@prisma/client").$Enums.Parentesco;
            observacoes: string;
            responsavel: {
                name: string;
                email: string;
                id: number;
                telefone: string;
                endereco: string;
            };
        };
    }>;
    findAll(): Promise<{
        message: string;
        criancas: {
            id: number;
            nome: string;
            idade: number;
            dataNascimento: string;
            genero: string;
            diagnostico: string;
            parentesco: import("@prisma/client").$Enums.Parentesco;
            observacoes: string;
            responsavel: {
                id: number;
                nome: string;
                email: string;
                telefone: string;
                endereco: string;
            };
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: {
            id: number;
            nome: string;
            idade: number;
            dataNascimento: string;
            genero: string;
            diagnostico: string;
            observacoes: string;
            parentesco: import("@prisma/client").$Enums.Parentesco;
            responsavel: {
                id: number;
                nome: string;
                email: string;
                telefone: string;
                endereco: string;
            };
        };
    }>;
    update(id: number, updateCriancaDto: UpdateCriancaDto): Promise<{
        message: string;
        crianca: {
            id: number;
            nome: string;
            idade: number;
            dataNascimento: string;
            genero: string;
            diagnostico: string;
            observacoes: string;
            parentesco: import("@prisma/client").$Enums.Parentesco;
            responsavel: {
                id: number;
                nome: string;
                email: string;
                telefone: string;
                endereco: string;
            };
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
