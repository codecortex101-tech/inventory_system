import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('move')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  createMovement(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @CurrentUser() user: any,
  ) {
    return this.stockService.createMovement(createStockMovementDto, user.id, user.organizationId);
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getMovementsHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockService.getMovementsHistory(
      user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 100,
      productId,
      type,
      startDate,
      endDate,
    );
  }
}
