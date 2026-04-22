import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      });

      return {
        message: 'Registration successful',
        user,
      };
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation (though we check it above, this is for safety)
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Error registering user');
    }
  }
}
