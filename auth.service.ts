import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SignupDto, LoginDto } from '../dto/auth.dto.js';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly users:
  User[] = [];

  constructor(private readonly jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
    try {
      const { name, email, password } = signupDto;

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = this.users.find(
        (user) => user.email === normalizedEmail,
      );

      if (existingUser) {
        throw new ConflictException(
          'User with this email already exists',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
      };

      this.users.push(newUser);

      const { password: _, ...userWithoutPassword } = newUser;

      return {
        message: 'User registered successfully',
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong during signup',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const normalizedEmail = email.trim().toLowerCase();

    const user = this.users.find(
      (item) => item.email === normalizedEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}