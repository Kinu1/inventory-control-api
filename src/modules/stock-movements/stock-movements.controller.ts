import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateStockInDto } from './dto/create-stock-in.dto';
import { CreateStockOutDto } from './dto/create-stock-out.dto';
import { StockMovementsService } from './stock-movements.service';

@ApiTags('Stock movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @ApiQuery({ name: 'productId', required: false })
  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.stockMovementsService.findAll(productId);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @Post('in')
  stockIn(
    @Body() dto: CreateStockInDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.stockMovementsService.stockIn(dto, user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @Post('out')
  stockOut(
    @Body() dto: CreateStockOutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.stockMovementsService.stockOut(dto, user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: AuthenticatedUser) {
    return this.stockMovementsService.adjust(dto, user.id);
  }
}
