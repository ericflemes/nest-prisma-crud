import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from '../cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'user:';

  constructor(
    private prisma: PrismaService,
    private cacheService: RedisCacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        birthDate: new Date(createUserDto.birthDate),
      },
    });

    // Clear cache after creating new user
    await this.cacheService.del(`${this.CACHE_PREFIX}all`);

    // Emit event
    this.eventEmitter.emit('user.created', user);

    return user;
  }

  async findAll(): Promise<User[]> {
    // Try to get from cache first
    const cachedUsers = await this.cacheService.get<User[]>(`${this.CACHE_PREFIX}all`);
    if (cachedUsers) {
      return cachedUsers;
    }

    // If not in cache, get from database
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Store in cache
    await this.cacheService.set(`${this.CACHE_PREFIX}all`, users, this.CACHE_TTL);

    return users;
  }

  async findOne(id: number): Promise<User | null> {
    // Try to get from cache first
    const cachedUser = await this.cacheService.get<User>(`${this.CACHE_PREFIX}${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from database
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // Store in cache
      await this.cacheService.set(`${this.CACHE_PREFIX}${id}`, user, this.CACHE_TTL);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Clear cache after update
    await Promise.all([
      this.cacheService.del(`${this.CACHE_PREFIX}${id}`),
      this.cacheService.del(`${this.CACHE_PREFIX}all`),
    ]);

    // Emit event
    this.eventEmitter.emit('user.updated', user);

    return user;
  }

  async remove(id: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    // Clear all related caches
    await Promise.all([
      this.cacheService.del(`${this.CACHE_PREFIX}${id}`),
      this.cacheService.del(`${this.CACHE_PREFIX}all`),
      // Clear all search-related caches
      this.cacheService.delByPattern(`${this.CACHE_PREFIX}search:*`),
    ]);

    // Emit event
    this.eventEmitter.emit('user.deleted', user);

    return user;
  }

  async clearCache(): Promise<void> {
    await Promise.all([
      this.cacheService.delByPattern(`${this.CACHE_PREFIX}*`),
    ]);
    console.log('All user caches cleared');
  }

  private async clearSearchCaches(): Promise<void> {
    try {
      const keys = await this.cacheService.keys(`${this.CACHE_PREFIX}search:*`);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.cacheService.del(key)));
      }
    } catch (error) {
      // Log error but don't throw to avoid disrupting the main operation
      console.error('Error clearing search caches:', error);
    }
  }

  async search(query: string): Promise<User[]> {
    if (!query) {
      return this.findAll();
    }

    const cacheKey = `${this.CACHE_PREFIX}search:${query}`;

    // First try to get from database
    const searchQuery = `
      SELECT 
        id,
        full_name as fullName,
        birth_date as birthDate,
        email,
        phone_number as phoneNumber,
        address1,
        address2,
        address3,
        address4,
        cpf,
        user_type as userType,
        brand,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users 
      WHERE LOWER(full_name) LIKE LOWER('%${query}%')
         OR LOWER(email) LIKE LOWER('%${query}%')
         OR cpf LIKE '%${query}%'
      ORDER BY created_at DESC
    `;

    console.log('Executing search query:', searchQuery);

    const users = await this.prisma.$queryRawUnsafe<User[]>(searchQuery);

    console.log('Found users:', users);

    // If we found results in database, format them and save to cache
    if (users && users.length > 0) {
      const formattedUsers = users.map(user => ({
        ...user,
        birthDate: new Date(user.birthDate),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));

      // Store in cache with shorter TTL for search results
      await this.cacheService.set(cacheKey, formattedUsers, 1800); // 30 minutes
      return formattedUsers;
    }

    // If no results in database, check cache as fallback
    const cachedResults = await this.cacheService.get<User[]>(cacheKey);
    if (cachedResults) {
      console.log('Found in cache:', cachedResults);
      return cachedResults;
    }

    // If no results anywhere, return empty array
    console.log('No results found in database or cache');
    return [];
  }
}
