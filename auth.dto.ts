import {IsMail, IsNotEmty, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
    @IsNotEmty ({ message: 'Name is required'})
    @MaxLength(50)
    name: string;

@IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @MinLength(8, { message: 'Password must be at Least 8 characters Long'})
  password: string;
}
 export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}