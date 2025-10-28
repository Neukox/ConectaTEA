import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, response: Response) {
    const { email, password } = loginDto;

    // Verificando se email existe no banco
    const usuario = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email não registrado.');
    }

    // Verificando se a senha está correta
    const senhaCorreta = await bcrypt.compare(password, usuario.password);

    if (!senhaCorreta) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    // Criando o token JWT
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    const token = this.jwtService.sign(payload);

    // Configurando cookie seguro
    response.cookie('jwt', token, {
      httpOnly: true, // Previne acesso via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS em produção
      sameSite: 'strict', // Proteção CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return {
      message: 'Login realizado com sucesso.',
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        tipo: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return user;
  }
}
