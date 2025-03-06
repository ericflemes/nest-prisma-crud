import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user/lead' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users/leads' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users/leads' })
  async search(@Query('q') query: string): Promise<User[]> {
    return this.usersService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user/lead' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user/lead' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user/lead' })
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(+id);
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear all users cache' })
  async clearCache(): Promise<{ message: string }> {
    await this.usersService.clearCache();
    return { message: 'Cache limpo com sucesso' };
  }
}
