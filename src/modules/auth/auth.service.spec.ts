import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers an operator and does not expose passwordHash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Operador Demo',
      email: 'operador@demo.com',
      passwordHash: 'hash',
      role: UserRole.OPERATOR,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.register({
      name: 'Operador Demo',
      email: 'operador@demo.com',
      password: 'Operador123!',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.role).toBe(UserRole.OPERATOR);
  });

  it('rejects login with an invalid password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@demo.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      role: UserRole.ADMIN,
      isActive: true,
    });

    await expect(
      service.login({ email: 'admin@demo.com', password: 'wrong-pass' }),
    ).rejects.toThrow('Invalid credentials.');
  });
});
