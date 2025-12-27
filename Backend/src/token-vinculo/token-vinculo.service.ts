import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import crypto from "crypto";
import QRCode from "qrcode";

@Injectable()
export class TokenVinculoService {
  constructor(private readonly prismaService: PrismaService) {}

  gerarCodigoUnico() {
    const codigo = crypto.randomBytes(16).toString("hex").toUpperCase();
    return codigo;
  }

  async gerarQRCode(codigo: string) {
    // Lógica para gerar QR Code
    const qrCodeDataURL = await QRCode.toDataURL(codigo);
    return qrCodeDataURL;
  }

  async cadastrarToken(criancaId: number, profissionalId: number) {
    // Lógica para gerar código de vinculação
    const codigo = this.gerarCodigoUnico();
    const QRCode = await this.gerarQRCode(codigo);

    // Salvar código no banco de dados com associação à criança
    return await this.prismaService.tokenVinculo.create({
      data: {
        codigo,
        crianca_id: criancaId,
        qr_code_url: QRCode,
        status: "AGUARDANDO",
        profissional_id: profissionalId,
        data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
      },
    });
  }

  async validarCodigo(codigo: string) {
    const token = await this.prismaService.tokenVinculo.findUnique({
      where: { codigo },
    });

    if (!token)
      throw new NotFoundException("Código de vinculação não encontrado.");

    switch (token.status) {
      case "USADO":
        throw new BadRequestException("Código de vinculação já foi usado.");
      case "CANCELADO":
        throw new BadRequestException("Código de vinculação foi cancelado.");
      case "EXPIRADO":
        throw new BadRequestException("Código de vinculação expirado.");
      case "AGUARDANDO":
        break;
      default:
        throw new BadRequestException("Código de vinculação inválido.");
    }

    if (token.data_expiracao && token.data_expiracao < new Date()) {
      await this.prismaService.tokenVinculo.update({
        where: { id: token.id },
        data: { status: "EXPIRADO" },
      });
      throw new BadRequestException("Código de vinculação expirado.");
    }

    return token;
  }

  async marcarTokenComoUsado(token: string, responsavelId: number) {
    const tokenRecord = await this.prismaService.tokenVinculo.findUnique({
      where: { codigo: token },
    });

    const tokenValido = await this.validarCodigo(token);

    await this.prismaService.tokenVinculo.update({
      where: { id: tokenValido.id },
      data: {
        status: "USADO",
        data_uso: new Date(),
        usado_por: responsavelId,
      },
    });
  }
}
