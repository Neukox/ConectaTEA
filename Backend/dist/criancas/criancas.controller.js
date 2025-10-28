"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriancasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const criancas_service_1 = require("./criancas.service");
const create_crianca_dto_1 = require("./dto/create-crianca.dto");
const update_crianca_dto_1 = require("./dto/update-crianca.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let CriancasController = class CriancasController {
    constructor(criancasService) {
        this.criancasService = criancasService;
    }
    async create(createCriancaDto, req) {
        return await this.criancasService.create(createCriancaDto, req.user?.id);
    }
    async findAll(req) {
        return await this.criancasService.findAll();
    }
    async findOne(id, req) {
        const criancaId = parseInt(id);
        if (isNaN(criancaId)) {
            throw new common_1.BadRequestException('ID deve ser um número válido.');
        }
        return await this.criancasService.findOne(criancaId);
    }
    async update(id, updateCriancaDto, req) {
        const criancaId = parseInt(id);
        if (isNaN(criancaId)) {
            throw new common_1.BadRequestException('ID deve ser um número válido.');
        }
        return await this.criancasService.update(criancaId, updateCriancaDto);
    }
    async remove(id, req) {
        return await this.criancasService.remove(+id);
    }
};
exports.CriancasController = CriancasController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar nova criança' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Criança cadastrada com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos.' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserType.RESPONSAVEL),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_crianca_dto_1.CreateCriancaDto, Object]),
    __metadata("design:returntype", Promise)
], CriancasController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as crianças' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserType.RESPONSAVEL, client_1.UserType.PROFISSIONAL),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CriancasController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar criança por ID' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CriancasController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar criança' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Criança atualizada com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Criança não encontrada.' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_crianca_dto_1.UpdateCriancaDto, Object]),
    __metadata("design:returntype", Promise)
], CriancasController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Deletar criança' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CriancasController.prototype, "remove", null);
exports.CriancasController = CriancasController = __decorate([
    (0, swagger_1.ApiTags)('Crianças'),
    (0, common_1.Controller)('criancas'),
    __metadata("design:paramtypes", [criancas_service_1.CriancasService])
], CriancasController);
//# sourceMappingURL=criancas.controller.js.map