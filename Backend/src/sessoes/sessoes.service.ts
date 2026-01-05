import { Injectable, Logger } from "@nestjs/common";
import { CreateSessaoDto } from "./dto/create-sessao.dto";
import { UpdateSessaoDto } from "./dto/update-sessao.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SessoesService {
  private readonly logger = new Logger(SessoesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSessaoDto: CreateSessaoDto, profissionalId: number) {
    this.logger.log(`Criando sessão para o profissional ID: ${profissionalId}`);

    this.logger.debug(`Data da sessão recebida: ${createSessaoDto.data}`);

    const sessao = await this.prisma.sessoes.create({
      data: {
        crianca_id: createSessaoDto.criancaId,
        data: createSessaoDto.data,
        tipo: createSessaoDto.tipoSessao,
        descricao: createSessaoDto.descricao,
        profissional_id: profissionalId,
        duracao: createSessaoDto.duracao,
        observacoes: createSessaoDto.observacoes,
      },
    });

    this.logger.log(`Sessão criada com ID: ${sessao.id}`);

    return {
      message: "Sessão criada com sucesso",
      sessao: sessao,
    };
  }

  findAll() {
    return `This action returns all sessoes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sessoes`;
  }

  update(id: number, updateSessoeDto: UpdateSessaoDto) {
    return `This action updates a #${id} sessoes`;
  }

  remove(id: number) {
    return `This action removes a #${id} sessoes`;
  }
}
