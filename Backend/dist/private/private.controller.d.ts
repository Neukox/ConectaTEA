import { UsersService } from '../users/users.service';
import { ProfissionaisService } from '../profissionais/profissionais.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
export declare class PrivateController {
    private readonly usersService;
    private readonly profissionaisService;
    constructor(usersService: UsersService, profissionaisService: ProfissionaisService);
    listarProfissionais(usuarioId?: string): Promise<{
        id: number;
        usuarioId: number;
        nome: string;
        email: string;
        telefone: string;
        endereco: string;
        especialidade: string;
        registroProfissional: string;
        titulo: string;
        formacaoAcademica: string;
        sobre: string;
        fotoPerfilUrl: string;
        codigoIdentificacao: string;
        locais: {
            id: number;
            nome: string;
            cidade: string;
            profissional_id: number;
        }[];
        redesSociais: {
            tipo: string;
            id: number;
            profissional_id: number;
            url: string | null;
        }[];
        areasAtuacao: ({
            area: {
                id: number;
                nome: string;
            };
        } & {
            profissional_id: number;
            area_id: number;
        })[];
    }[]>;
    atualizarPerfil(id: string, updateUserDto: UpdateUserDto): Promise<{
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
}
