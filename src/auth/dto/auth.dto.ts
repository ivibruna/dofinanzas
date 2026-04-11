import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class AuthDto {
  // @ApiProperty es lo que hace que Swagger dibuje el campo
  @ApiProperty({ 
    example: 'ivan.tfm@dofinanzas.com', 
    description: 'El correo electrónico del usuario' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'MiSuperPassword123', 
    description: 'La contraseña (mínimo 6 caracteres)' 
  })
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    example: 'Iván',
    description: 'Nombre de usuario' 
  })
  @IsNotEmpty()
  name: string;
}
