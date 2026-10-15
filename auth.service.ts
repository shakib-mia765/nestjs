import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {

    private readonly users = []; 

  constructor(private readonly jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
    try {
      const { email, password, name } = signupDto; 

      const existingUser = this.users.find(u => u.email === email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
     const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
      this.users.push(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      return { message: 'User registered successfully', user: userWithoutPassword };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Something went wrong during signup');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
      

     const user = this.users.find(u => u.email === email);
     if (!user) {
         throw new UnauthorizedException('Invalid credentials');
    const payload = { email: user.email, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
        message: Login successful'
        accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    };
  }
}
    }
