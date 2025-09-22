"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { name, email, password, tipo } = createUserDto;
        console.log("=== DEBUG REGISTRO ===");
        console.log("Dados recebidos:", { name, email, password: "***", tipo });
        if (!name || !name.trim()) {
            throw new common_1.BadRequestException("Nome é obrigatório.");
        }
        if (!email || !email.trim()) {
            throw new common_1.BadRequestException("Email é obrigatório.");
        }
        if (!password || password.length < 6) {
            throw new common_1.BadRequestException("Senha deve ter pelo menos 6 caracteres.");
        }
        if (!tipo || !tipo.trim()) {
            throw new common_1.BadRequestException("Tipo de usuário é obrigatório.");
        }
        const emailTrimmed = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailTrimmed)) {
            throw new common_1.BadRequestException("Email inválido.");
        }
        const tipoUpperCase = tipo.toUpperCase();
        console.log("Tipo convertido:", tipoUpperCase);
        console.log("UserType values:", Object.values(client_1.UserType));
        if (!Object.values(client_1.UserType).includes(tipoUpperCase)) {
            console.log("Tipo inválido detectado");
            throw new common_1.BadRequestException("Tipo de usuário inválido. Use: PROFISSIONAL ou RESPONSAVEL.");
        }
        const emailExistente = await this.prisma.user.findFirst({
            where: { email: emailTrimmed },
        });
        if (emailExistente) {
            throw new common_1.ConflictException("Este email já está registrado. Use outro email ou faça login.");
        }
        const senhaCriptografada = await bcrypt.hash(password, 10);
        const resultado = await this.prisma.$transaction(async (prisma) => {
            const novoUsuario = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: emailTrimmed,
                    password: senhaCriptografada,
                    tipo: tipoUpperCase,
                },
            });
            if (tipoUpperCase === "PROFISSIONAL") {
                await prisma.profissional.create({
                    data: {
                        usuario_id: novoUsuario.id,
                        especialidade: "",
                        registro_profissional: "",
                        titulo: "",
                        formacaoAcademica: "",
                        sobre: "",
                        codigoIdentificacao: `PROF${novoUsuario.id.toString().padStart(4, "0")}`,
                    },
                });
            }
            return novoUsuario;
        });
        return {
            message: "Usuário registrado com sucesso.",
            user: {
                id: resultado.id,
                name: resultado.name,
                email: resultado.email,
                tipo: resultado.tipo,
            },
        };
    }
    async findAll() {
        return await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                tipo: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                telefone: true,
                endereco: true,
                tipo: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException("Usuário não encontrado.");
        }
        return {
            message: "Usuário encontrado com sucesso!",
            data: user,
        };
    }
    async update(id, updateUserDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            throw new common_1.BadRequestException("Usuário não encontrado.");
        }
        if (updateUserDto.email) {
            const emailTrimmed = updateUserDto.email.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailTrimmed)) {
                throw new common_1.BadRequestException("Email inválido.");
            }
            const emailExistente = await this.prisma.user.findFirst({
                where: {
                    email: emailTrimmed,
                    NOT: { id },
                },
            });
            if (emailExistente) {
                throw new common_1.ConflictException("Email já está sendo usado por outro usuário.");
            }
            updateUserDto.email = emailTrimmed;
        }
        const userUpdateData = {
            ...(updateUserDto.name && { name: updateUserDto.name }),
            ...(updateUserDto.email && { email: updateUserDto.email }),
            ...(updateUserDto.telefone && { telefone: updateUserDto.telefone }),
            ...(updateUserDto.endereco && { endereco: updateUserDto.endereco }),
        };
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: userUpdateData,
            select: {
                id: true,
                name: true,
                email: true,
                telefone: true,
                endereco: true,
                tipo: true,
            },
        });
        return {
            message: "Perfil atualizado com sucesso!",
            data: updatedUser,
        };
    }
    async remove(id) {
        return await this.prisma.user.delete({
            where: { id },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map