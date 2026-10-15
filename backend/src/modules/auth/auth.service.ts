import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.users.create({
      name: dto.name,
      email,
      phone: dto.phone,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.accountType === 'OWNER' ? Role.OWNER : Role.RENTER,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.users.toPublic(user),
    };
  }
}
