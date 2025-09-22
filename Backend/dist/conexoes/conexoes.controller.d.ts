import { ConexoesService } from './conexoes.service';
import { CreateConexaoDto } from './dto/create-conexao.dto';
import { UpdateConexaoDto } from './dto/update-conexao.dto';
export declare class ConexoesController {
    private readonly conexoesService;
    constructor(conexoesService: ConexoesService);
    enviarSolicitacao(createConexaoDto: CreateConexaoDto, req: any): Promise<{
        message: string;
        data: {
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        };
    }>;
    listarSolicitacoesRecebidas(req: any): Promise<{
        message: string;
        data: ({
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        })[];
    }>;
    listarSolicitacoesEnviadas(req: any): Promise<{
        message: string;
        data: ({
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        })[];
    }>;
    listarConexoes(req: any): Promise<{
        message: string;
        data: ({
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        })[];
    }>;
    responderSolicitacao(id: string, updateConexaoDto: UpdateConexaoDto, req: any): Promise<{
        message: string;
        data: {
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        };
    }>;
    listarConexoesPorProfissional(profissionalId: string): Promise<{
        message: string;
        data: ({
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        })[];
    }>;
    filtrarConexoes(solicitanteProfId?: string, solicitadoProfId?: string, req?: any): Promise<{
        message: string;
        data: ({
            solicitante: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
            solicitado: {
                usuario: {
                    name: string;
                    email: string;
                    id: number;
                    telefone: string;
                };
            } & {
                id: number;
                usuario_id: number;
                especialidade: string;
                registro_profissional: string;
                titulo: string | null;
                formacaoAcademica: string | null;
                sobre: string | null;
                fotoPerfilUrl: string | null;
                codigoIdentificacao: string | null;
            };
        } & {
            id: number;
            criado_em: Date;
            solicitante_id: number;
            solicitado_id: number;
            status: import("@prisma/client").$Enums.StatusConexao;
        })[];
    }>;
    removerConexao(id: string, req: any): Promise<{
        message: string;
    }>;
}
