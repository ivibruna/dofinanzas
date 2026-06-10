import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Saving Goals (Metas de Ahorro)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saving-goals')
export class SavingGoalsController {
  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva meta de ahorro (Hucha)' })
  create(@Request() req, @Body() createSavingGoalDto: CreateSavingGoalDto) {
    return this.savingGoalsService.create(req.user.userId, createSavingGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ver todas mis metas de ahorro' })
  findAll(@Request() req) {
    return this.savingGoalsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de una meta específica' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.savingGoalsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar datos de la meta' })
  update(@Request() req, @Param('id') id: string, @Body() updateSavingGoalDto: UpdateSavingGoalDto) {
    return this.savingGoalsService.update(req.user.userId, id, updateSavingGoalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar una meta de ahorro' })
  remove(@Request() req, @Param('id') id: string) {
    return this.savingGoalsService.remove(req.user.userId, id);
  }
}
