import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    clearCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
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

      const expectedResult = { id: 1, ...createUserDto };
      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        { id: 1, fullName: 'John Doe' },
        { id: 2, fullName: 'Jane Doe' },
      ];
      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const expectedResult = { id: 1, fullName: 'John Doe' };
      mockUsersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'John Updated',
      };

      const expectedResult = { id: 1, fullName: 'John Updated' };
      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = { id: 1, fullName: 'John Doe' };
      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    it('should search users', async () => {
      const query = 'John';
      const expectedResult = [{ id: 1, fullName: 'John Doe' }];
      mockUsersService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(query);

      expect(result).toEqual(expectedResult);
      expect(service.search).toHaveBeenCalledWith(query);
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const expectedResult = { message: 'Cache limpo com sucesso' };
      mockUsersService.clearCache.mockResolvedValue(undefined);

      const result = await controller.clearCache();

      expect(result).toEqual(expectedResult);
      expect(service.clearCache).toHaveBeenCalled();
    });
  });
});
