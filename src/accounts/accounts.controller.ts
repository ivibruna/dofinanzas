import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Patch, Delete, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Nuestro portero
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Accounts')
@ApiBearerAuth() // Candado en Swagger
@UseGuards(JwtAuthGuard) // Bloquear las peticiones sin Token
@Controller('accounts')

export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta' })
  create(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    // Gracias a Passport, el ID del JWT vive automáticamente en req.user
    const userId = req.user.userId;
    return this.accountsService.create(userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis cuentas' })
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de una cuenta específica' })
  @ApiParam({ name: 'id', description: 'El ID (UUID) de la cuenta' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.accountsService.findOne(req.user.userId, id);
  }

  @Get('summary/net-worth')
  @ApiOperation({ summary: 'Obtener el patrimonio total (Suma de balances)' })
  getNetWorth(@Request() req) {
    return this.accountsService.getNetWorth(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar una cuenta existente' })
  @ApiParam({ name: 'id', description: 'El ID (UUID) de la cuenta' })
  update(@Request() req, @Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(req.user.userId, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar/Borrar una cuenta (Borrado lógico)' })
  @ApiParam({ name: 'id', description: 'El ID (UUID) de la cuenta' })
  remove(@Request() req, @Param('id') id: string) {
    return this.accountsService.remove(req.user.userId, id);
  }
}
