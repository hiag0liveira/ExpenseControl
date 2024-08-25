import { Repository } from 'typeorm';
import { CategoryService } from '../../src/category/category.service';
import { Category } from '../../src/category/entities/category.entity';
import { CreateCategoryDto } from '../../src/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/category/dto/update-category.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionService } from '../../src/transaction/transaction.service'; // Importar o serviço

describe('CategoryService', () => {
    let service: CategoryService;
    let mockCategoryRepository: Repository<Category>;
    let mockTransactionService: TransactionService; // Adicionar mock do TransactionService

    beforeEach(async () => {
        // Mock do TransactionService
        mockTransactionService = {
            // Mock dos métodos que o serviço pode utilizar
        } as any as TransactionService;

        // Mock do CategoryRepository
        mockCategoryRepository = {
            findOne: jest.fn(),
            findBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            findAll: jest.fn(),
        } as any as Repository<Category>;

        service = new CategoryService(mockCategoryRepository);
    });

    describe('create', () => {
        it('should throw an exception when the category already exists', async () => {
            const createCategoryDto: CreateCategoryDto = {
                title: 'Food',
            };

            const category: Category = {
                id: 1,
                title: 'Food',
                user: { id: 1 } as any,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCategoryRepository.findBy = jest.fn().mockResolvedValue([category]);

            await expect(service.create(createCategoryDto, 1)).rejects.toThrow(BadRequestException);
        });

        it('should create a new category', async () => {
            const createCategoryDto: CreateCategoryDto = {
                title: 'Food',
            };

            const newCategory: Category = {
                id: 1,
                title: 'Food',
                user: { id: 1 } as any,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCategoryRepository.findBy = jest.fn().mockResolvedValue([]);
            mockCategoryRepository.save = jest.fn().mockResolvedValue(newCategory);

            const result = await service.create(createCategoryDto, 1);

            expect(result).toEqual(newCategory);
            expect(mockCategoryRepository.save).toHaveBeenCalledWith({
                title: 'Food',
                user: { id: 1 },
            });
        });
    });

    describe('findOne', () => {
        it('should return a category', async () => {
            const category: Category = {
                id: 1,
                title: 'Food',
                user: { id: 1 } as any,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(category);

            const result = await service.findOne(1);

            expect(result).toEqual(category);
        });

        it('should throw a NotFoundException if category is not found', async () => {
            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should throw a NotFoundException if category does not exist', async () => {
            const updateCategoryDto: UpdateCategoryDto = { title: 'Updated Food' };
            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(service.update(1, updateCategoryDto)).rejects.toThrow(NotFoundException);
        });

        it('should update the category if it exists', async () => {
            const updateCategoryDto: UpdateCategoryDto = { title: 'Updated Food' };
            const category: Category = {
                id: 1,
                title: 'Food',
                user: { id: 1 } as any,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(category);
            mockCategoryRepository.update = jest.fn().mockResolvedValue({ affected: 1 });

            const result = await service.update(1, updateCategoryDto);

            expect(result).toEqual({ affected: 1 });
            expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, updateCategoryDto);
        });
    });

    describe('remove', () => {
        it('should throw a NotFoundException if category does not exist', async () => {
            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });

        it('should remove the category if it exists', async () => {
            const category: Category = {
                id: 1,
                title: 'Food',
                user: { id: 1 } as any,
                transactions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCategoryRepository.findOne = jest.fn().mockResolvedValue(category);
            mockCategoryRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

            const result = await service.remove(1);

            expect(result).toEqual({ affected: 1 });
            expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('findAll', () => {
        it('should return an array of categories', async () => {
            const categories: Category[] = [
                {
                    id: 1,
                    title: 'Food',
                    user: { id: 1 } as any,
                    transactions: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    title: 'Travel',
                    user: { id: 1 } as any,
                    transactions: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockCategoryRepository.find = jest.fn().mockResolvedValue(categories);

            const result = await service.findAll(1);

            expect(result).toEqual(categories);
            expect(mockCategoryRepository.find).toHaveBeenCalledWith({
                where: { user: { id: 1 } },
                relations: { transactions: true },
            });
        });
    });
});
