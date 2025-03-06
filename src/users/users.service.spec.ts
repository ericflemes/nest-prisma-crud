import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from '../cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let cacheService: RedisCacheService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn(),
    keys: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisCacheService,
          useValue: mockCacheService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<RedisCacheService>(RedisCacheService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01T00:00:00Z',
        phoneNumber: '+55 11 98765-4321',
        address1: 'Main Street',
        address2: null,
        address3: null,
        address4: null,
        userType: 'primary',
        brand: 'brand-x',
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        birthDate: new Date(createUserDto.birthDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          birthDate: new Date(createUserDto.birthDate),
        },
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('user:all');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', mockUser);
    });
  });

  describe('findAll', () => {
    it('should return users from cache if available', async () => {
      const mockUsers = [{ id: 1, fullName: 'John Doe' }];
      mockCacheService.get.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockCacheService.get).toHaveBeenCalledWith('user:all');
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and cache users if not in cache', async () => {
      const mockUsers = [{ id: 1, fullName: 'John Doe' }];
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(mockCacheService.set).toHaveBeenCalledWith('user:all', mockUsers, 3600);
    });
  });

  describe('findOne', () => {
    it('should return user from cache if available', async () => {
      const mockUser = { id: 1, fullName: 'John Doe' };
      mockCacheService.get.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockCacheService.get).toHaveBeenCalledWith('user:1');
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch and cache user if not in cache', async () => {
      const mockUser = { id: 1, fullName: 'John Doe' };
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCacheService.set).toHaveBeenCalledWith('user:1', mockUser, 3600);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'John Updated',
      };

      const mockUser = { id: 1, fullName: 'John Updated' };
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('user:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('user:all');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.updated', mockUser);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const mockUser = { id: 1, fullName: 'John Doe' };
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('user:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('user:all');
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith('user:search:*');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.deleted', mockUser);
    });
  });

  describe('search', () => {
    it('should return all users when query is empty', async () => {
      const mockUsers = [{ id: 1, fullName: 'John Doe' }];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockCacheService.get.mockResolvedValue(null);

      const result = await service.search('');

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });

    it('should search users and cache results', async () => {
      const query = 'John';
      const mockUsers = [{
        id: 1,
        fullName: 'John Doe',
        birthDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

      mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockUsers);
      mockCacheService.get.mockResolvedValue(null);

      const result = await service.search(query);

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('user:search:John', mockUsers, 1800);
    });
  });
});
