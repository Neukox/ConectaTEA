import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCriancaDto } from "./dto/create-crianca.dto";
import { UpdateCriancaDto } from "./dto/update-crianca.dto";
import DateUtils from "../common/utils/date.utils";
import { TokenVinculoService } from "../token-vinculo/token-vinculo.service";
import { VinculacaoService } from "../vinculacao/vinculacao.service";
import bcrypt from "bcrypt";

@Injectable()
export class CriancasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenVinculoService: TokenVinculoService
  ) {}

  async create(createCriancaDto: CreateCriancaDto, profissionalId?: number) {
    const {
      fullName,
      birthDate,
      gender,
      diagnosis,
      parentesco,
      notes,
      responsible,
    } = createCriancaDto;
    const { name, phone, email, address } = responsible;

    console.log("=== CADASTRO DE CRIANÇA ===");

    const calculatedAge = DateUtils.calculateAge(new Date(birthDate));

    // Criar responsável
    const userData: any = {
      name,
      telefone: phone,
      password: await bcrypt.hash("senha-temporaria", 10), // Senha padrão, deve ser alterada posteriormente
      tipo: "RESPONSAVEL",
    };
    if (email) userData.email = email;
    if (address) userData.endereco = address;

    // Usar transação para garantir integridade dos dados
    const result = await this.prisma.$transaction(async (prisma) => {
      // Criar responsável dentro da transação
      const responsavel = await prisma.user.create({
        data: userData,
      });

      // Criar criança dentro da transação
      const novaCrianca = await prisma.crianca.create({
        data: {
          nome: fullName,
          data_nascimento: new Date(birthDate),
          genero: gender,
          diagnostico: diagnosis,
          diagnosticoDetalhes: "",
          parentesco,
          observacoes: notes || "",
          responsavel_id: responsavel.id,
        },
        include: {
          responsavel: {
            select: {
              id: true,
              name: true,
              email: true,
              telefone: true,
              endereco: true,
            },
          },
        },
      });

      if (profissionalId) {
        await prisma.profissionalCriança.create({
          data: {
            crianca_id: novaCrianca.id,
            profissional_id: profissionalId,
            status_vinculo: "AGUARDANDO",
          },
        });
      }

      // Gerar código de vínculo e QR Code
      const codigoVinculo = this.tokenVinculoService.gerarCodigoUnico();
      const QRCode = await this.tokenVinculoService.gerarQRCode(codigoVinculo);

      const codigosVinculo = await prisma.tokenVinculo.create({
        data: {
          codigo: codigoVinculo,
          crianca_id: novaCrianca.id,
          status: "AGUARDANDO",
          profissional_id: profissionalId || null,
          data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
          qr_code_url: QRCode,
        },
      });

      await prisma.historicoVinculos.create({
        data: {
          crianca_id: novaCrianca.id,
          profissional_id: profissionalId || null,
          responsavel_id: responsavel.id,
          tipo_evento: "TOKEN_GERADO",
          descricao: `Código de vínculo gerado para a criança ${novaCrianca.nome}.`,
        },
      });

      return {
        message: "Criança cadastrada com sucesso!",
        crianca: {
          id: novaCrianca.id,
          nome: novaCrianca.nome,
          idade: calculatedAge,
          dataDeNascimento: novaCrianca.data_nascimento
            .toISOString()
            .split("T")[0],
          genero: novaCrianca.genero,
          diagnostico: novaCrianca.diagnostico,
          parentesco: novaCrianca.parentesco,
          observacoes: novaCrianca.observacoes,
          responsavel: novaCrianca.responsavel,
          status_vinculo_responsavel: novaCrianca.status_vinculo_responsavel,
        },
        codigoParaVinculo: codigosVinculo.codigo,
        qrcodeParaVinculo: codigosVinculo.qr_code_url,
      };
    });

    return result;
  }

  async findAll() {
    const criancasRaw = await this.prisma.crianca.findMany({
      include: {
        responsavel: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
            endereco: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // Mapear dados para o formato esperado pelo frontend
    const criancas = criancasRaw.map((crianca) => ({
      id: crianca.id,
      nome: crianca.nome,
      idade: Math.floor(
        (new Date().getTime() - new Date(crianca.data_nascimento).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      ),
      dataNascimento: crianca.data_nascimento.toISOString().split("T")[0], // YYYY-MM-DD
      genero: crianca.genero,
      diagnostico: crianca.diagnostico,
      parentesco: crianca.parentesco,
      observacoes: crianca.observacoes,
      responsavel: {
        id: crianca.responsavel.id,
        nome: crianca.responsavel.name, // Mapear name para nome
        email: crianca.responsavel.email,
        telefone: crianca.responsavel.telefone,
        endereco: crianca.responsavel.endereco,
      },
    }));

    return {
      message: "Crianças listadas com sucesso!",
      criancas,
      total: criancas.length,
    };
  }

  async findOne(id: number) {
    const crianca = await this.prisma.crianca.findFirst({
      where: { id },
      include: {
        responsavel: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
            endereco: true,
          },
        },
      },
    });

    if (!crianca) {
      throw new BadRequestException("Criança não encontrada.");
    }

    // Calcular idade
    const hoje = new Date();
    const nascimento = new Date(crianca.data_nascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }

    // Retornar no formato esperado pelo frontend
    return {
      message: "Criança encontrada com sucesso!",
      data: {
        id: crianca.id,
        nome: crianca.nome,
        idade,
        dataNascimento: crianca.data_nascimento.toISOString().split("T")[0],
        genero: crianca.genero,
        diagnostico: crianca.diagnostico,
        observacoes: crianca.observacoes,
        parentesco: crianca.parentesco,
        responsavel: {
          id: crianca.responsavel.id,
          nome: crianca.responsavel.name, // Mapear name para nome
          email: crianca.responsavel.email,
          telefone: crianca.responsavel.telefone,
          endereco: crianca.responsavel.endereco,
        },
      },
    };
  }

  async update(id: number, updateCriancaDto: UpdateCriancaDto) {
    // Verificar se a criança existe
    const criancaExistente = await this.prisma.crianca.findFirst({
      where: { id },
      include: {
        responsavel: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
            endereco: true,
          },
        },
      },
    });

    if (!criancaExistente) {
      throw new BadRequestException("Criança não encontrada.");
    }

    try {
      // Atualizar dados da criança
      const dadosAtualizarCrianca: any = {};

      if (updateCriancaDto.nome)
        dadosAtualizarCrianca.nome = updateCriancaDto.nome;
      if (updateCriancaDto.dataNascimento) {
        dadosAtualizarCrianca.data_nascimento = new Date(
          updateCriancaDto.dataNascimento
        );
      }
      if (updateCriancaDto.genero)
        dadosAtualizarCrianca.genero = updateCriancaDto.genero;
      if (updateCriancaDto.diagnostico)
        dadosAtualizarCrianca.diagnostico = updateCriancaDto.diagnostico;
      if (updateCriancaDto.observacoes)
        dadosAtualizarCrianca.observacoes = updateCriancaDto.observacoes;
      if (updateCriancaDto.parentesco)
        dadosAtualizarCrianca.parentesco = updateCriancaDto.parentesco;

      // Atualizar dados do responsável se fornecidos
      const dadosAtualizarResponsavel: any = {};
      if (updateCriancaDto.nomeResponsavel)
        dadosAtualizarResponsavel.name = updateCriancaDto.nomeResponsavel;
      if (updateCriancaDto.telefoneResponsavel)
        dadosAtualizarResponsavel.telefone =
          updateCriancaDto.telefoneResponsavel;
      if (updateCriancaDto.emailResponsavel)
        dadosAtualizarResponsavel.email = updateCriancaDto.emailResponsavel;
      if (updateCriancaDto.enderecoResponsavel)
        dadosAtualizarResponsavel.endereco =
          updateCriancaDto.enderecoResponsavel;

      // Atualizar responsável se há dados para atualizar
      if (Object.keys(dadosAtualizarResponsavel).length > 0) {
        await this.prisma.user.update({
          where: { id: criancaExistente.responsavel_id },
          data: dadosAtualizarResponsavel,
        });
      }

      // Atualizar criança
      const criancaAtualizada = await this.prisma.crianca.update({
        where: { id },
        data: dadosAtualizarCrianca,
        include: {
          responsavel: {
            select: {
              id: true,
              name: true,
              email: true,
              telefone: true,
              endereco: true,
            },
          },
        },
      });

      // Calcular idade
      const hoje = new Date();
      const nascimento = new Date(criancaAtualizada.data_nascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = nascimento.getMonth();

      if (
        mesAtual < mesNascimento ||
        (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
      ) {
        idade--;
      }

      // Retornar no formato esperado pelo frontend
      return {
        message: "Criança atualizada com sucesso!",
        crianca: {
          id: criancaAtualizada.id,
          nome: criancaAtualizada.nome,
          idade,
          dataNascimento: criancaAtualizada.data_nascimento
            .toISOString()
            .split("T")[0],
          genero: criancaAtualizada.genero,
          diagnostico: criancaAtualizada.diagnostico,
          observacoes: criancaAtualizada.observacoes,
          parentesco: criancaAtualizada.parentesco,
          responsavel: {
            id: criancaAtualizada.responsavel.id,
            nome: criancaAtualizada.responsavel.name, // Mapear name para nome
            email: criancaAtualizada.responsavel.email,
            telefone: criancaAtualizada.responsavel.telefone,
            endereco: criancaAtualizada.responsavel.endereco,
          },
        },
      };
    } catch (error) {
      console.error("Erro ao atualizar criança:", error);
      throw new BadRequestException("Erro ao atualizar criança.");
    }
  }

  async remove(id: number) {
    // Verificar se a criança existe
    const crianca = await this.prisma.crianca.findFirst({
      where: { id },
    });

    if (!crianca) {
      throw new BadRequestException("Criança não encontrada.");
    }

    // Usar transação para deletar em cascata
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Deletar relacionamentos na ordem correta
        // 1. Deletar tokens de vínculo
        await prisma.tokenVinculo.deleteMany({
          where: { crianca_id: id },
        });

        // 2. Deletar consentimentos
        await prisma.consentimento.deleteMany({
          where: { crianca_id: id },
        });

        // 3. Deletar histórico de vínculos
        await prisma.historicoVinculos.deleteMany({
          where: { crianca_id: id },
        });

        // 4. Deletar metas (progressos serão deletados em cascata)
        await prisma.meta.deleteMany({
          where: { crianca_id: id },
        });

        // 5. Deletar sessões
        await prisma.sessoes.deleteMany({
          where: { crianca_id: id },
        });

        // 6. Deletar vínculo profissional-criança
        await prisma.profissionalCriança.deleteMany({
          where: { crianca_id: id },
        });

        // 7. Finalmente, deletar a criança
        await prisma.crianca.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error("Erro ao deletar criança:", error);
      throw new BadRequestException(
        "Erro ao deletar criança. Verifique se há dependências."
      );
    }

    return {
      message: "Criança removida com sucesso!",
    };
  }

  async obterCodigoVinculo(criancaId: number) {
    console.log("Obtendo código de vínculo para criança ID:", criancaId);
    const token = await this.prisma.tokenVinculo.findFirst({
      where: {
        crianca_id: criancaId,
        status: "AGUARDANDO",
      },
    });

    if (!token) {
      throw new BadRequestException(
        "Código de vínculo não encontrado ou já foi utilizado."
      );
    }

    return {
      codigoParaVinculo: token.codigo,
      qrcodeParaVinculo: token.qr_code_url,
    };
  }
}
