import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
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

    return {
      message: 'Login realizado com sucesso.',
      token,
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
