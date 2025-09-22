import { PrismaService } from '../prisma/prisma.service';
import { CreateConexaoDto } from './dto/create-conexao.dto';
import { UpdateConexaoDto } from './dto/update-conexao.dto';
export declare class ConexoesService {
    private prisma;
    constructor(prisma: PrismaService);
    enviarSolicitacao(usuarioId: number, createConexaoDto: CreateConexaoDto): Promise<{
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
    listarSolicitacoesRecebidas(usuarioId: number): Promise<{
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
    listarSolicitacoesEnviadas(usuarioId: number): Promise<{
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
    listarConexoes(usuarioId: number): Promise<{
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
    responderSolicitacao(usuarioId: number, conexaoId: number, updateConexaoDto: UpdateConexaoDto): Promise<{
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
    removerConexao(usuarioId: number, conexaoId: number): Promise<{
        message: string;
    }>;
    listarConexoesPorProfissional(profissionalId: number): Promise<{
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
    filtrarConexoes(params: {
        solicitanteProfId?: number;
        solicitadoProfId?: number;
    }): Promise<{
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
}
