import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user.organizationId, user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('expired') expired?: string,
    @Query('expiringSoon') expiringSoon?: string,
    @Query('activeExpiration') activeExpiration?: string,
    @Query('hasExpirationDate') hasExpirationDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.productsService.findAll(
      user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      categoryId,
      status,
      expired === 'true',
      expiringSoon === 'true',
      activeExpiration === 'true',
      hasExpirationDate === 'true',
    );
  }

  @Get('low-stock')
  getLowStock(@CurrentUser() user: any) {
    return this.productsService.getLowStockProducts(user.organizationId);
  }

  @Get('out-of-stock')
  getOutOfStock(@CurrentUser() user: any) {
    return this.productsService.getOutOfStockProducts(user.organizationId);
  }

  @Get('expiration-stats')
  getExpirationStats(@CurrentUser() user: any) {
    return this.productsService.getExpirationStatistics(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, updateProductDto, user.organizationId, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.organizationId, user.id);
  }
}
