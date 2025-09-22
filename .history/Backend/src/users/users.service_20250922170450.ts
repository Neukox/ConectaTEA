import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, tipo } = createUserDto;

    console.log('=== DEBUG REGISTRO ===');
    console.log('Dados recebidos:', { name, email, password: '***', tipo });

    // Validações básicas
    if (!name || !name.trim()) {
      throw new BadRequestException('Nome é obrigatório.');
    }

    if (!email || !email.trim()) {
      throw new BadRequestException('Email é obrigatório.');
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('Senha deve ter pelo menos 6 caracteres.');
    }

    if (!tipo || !tipo.trim()) {
      throw new BadRequestException('Tipo de usuário é obrigatório.');
    }

    // Verificar email trimmed
    const emailTrimmed = email.trim().toLowerCase();
    
    // Regex para validação de e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailTrimmed)) {
      throw new BadRequestException('Email inválido.');
    }

    // Converter tipo para maiúscula e validar
    const tipoUpperCase = tipo.toUpperCase();
    console.log('Tipo convertido:', tipoUpperCase);
    console.log('UserType values:', Object.values(UserType));
    
    if (!Object.values(UserType).includes(tipoUpperCase as UserType)) {
      console.log('Tipo inválido detectado');
      throw new BadRequestException('Tipo de usuário inválido. Use: PROFISSIONAL ou RESPONSAVEL.');
    }

    // Verificar se email já existe
    const emailExistente = await this.prisma.user.findFirst({
      where: { email: emailTrimmed },
    });

    if (emailExistente) {
      throw new ConflictException('Este email já está registrado. Use outro email ou faça login.');
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(password, 10);

    // Criar usuário
    const novoUsuario = await this.prisma.user.create({
      data: {
        name,
        email: emailTrimmed,
        password: senhaCriptografada,
        tipo: tipoUpperCase as UserType,
      },
    });

    return {
      message: 'Usuário registrado com sucesso.',
      user: {
        id: novoUsuario.id,
        name: novoUsuario.name,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
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

  async findOne(id: number) {
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
      throw new BadRequestException('Usuário não encontrado.');
    }

    return {
      message: 'Usuário encontrado com sucesso!',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    // Se email foi fornecido, verificar se já existe em outro usuário
    if (updateUserDto.email) {
      const emailTrimmed = updateUserDto.email.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      if (!emailRegex.test(emailTrimmed)) {
        throw new BadRequestException('Email inválido.');
      }

      const emailExistente = await this.prisma.user.findFirst({
        where: { 
          email: emailTrimmed,
          NOT: { id },
        },
      });

      if (emailExistente) {
        throw new ConflictException('Email já está sendo usado por outro usuário.');
      }

      updateUserDto.email = emailTrimmed;
    }

    // Filtrar apenas campos que existem no modelo User
    const userUpdateData = {
      ...(updateUserDto.name && { name: updateUserDto.name }),
      ...(updateUserDto.email && { email: updateUserDto.email }),
      ...(updateUserDto.telefone && { telefone: updateUserDto.telefone }),
      ...(updateUserDto.endereco && { endereco: updateUserDto.endereco }),
    };

    // Atualizar usuário
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
      message: 'Perfil atualizado com sucesso!',
      data: updatedUser,
    };
  }

  async remove(id: number) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
