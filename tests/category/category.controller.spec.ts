import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../../src/category/category.controller';
import { CategoryService } from '../../src/category/category.service';
import { CreateCategoryDto } from '../../src/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/category/dto/update-category.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../../src/user/entities/user.entity';
import { AuthorGuard } from '../../src/guard/author.guard';
import { TransactionService } from '../../src/transaction/transaction.service';

describe('CategoryController', () => {
    let controller: CategoryController;
    let service: CategoryService;

    const user: User = {
        id: 1,
        email: 'test@test.com',
        password: 'password',
        categories: [],
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = {
        id: 1,
        title: 'Food',
        user: user,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    interface UpdateResult {
        raw: any;
        generatedMaps: any[];
        affected: number;
    }

    interface DeleteResult {
        raw: any;
        affected: number;
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                {
                    provide: CategoryService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: TransactionService,
                    useValue: {}, // Mock vazio ou com métodos simulados
                },
                {
                    provide: AuthorGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true), // Mock do guard sempre retornando true
                    },
                },
            ],
        }).compile();

        controller = module.get<CategoryController>(CategoryController);
        service = module.get<CategoryService>(CategoryService);
    });

    describe('create', () => {
        it('should create a category', async () => {
            const createCategoryDto: CreateCategoryDto = { title: 'Food' };
            const req = { user: { id: 1 } };

            jest.spyOn(service, 'create').mockResolvedValue(result);

            const response = await controller.create(createCategoryDto, req);

            expect(response).toEqual(result);
            expect(service.create).toHaveBeenCalledWith(createCategoryDto, req.user.id);
        });

        it('should throw a BadRequestException if category already exists', async () => {
            const createCategoryDto: CreateCategoryDto = { title: 'Food' };
            const req = { user: { id: 1 } };

            jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('This category already exists!'));

            await expect(controller.create(createCategoryDto, req)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return an array of categories', async () => {
            const req = { user: { id: 1 } };
            const categories = [result];

            jest.spyOn(service, 'findAll').mockResolvedValue(categories);

            const response = await controller.findAll(req);

            expect(response).toEqual(categories);
            expect(service.findAll).toHaveBeenCalledWith(req.user.id);
        });
    });

    describe('findOne', () => {
        it('should return a category', async () => {
            const id = '1';

            jest.spyOn(service, 'findOne').mockResolvedValue(result);

            const response = await controller.findOne(id);

            expect(response).toEqual(result);
            expect(service.findOne).toHaveBeenCalledWith(+id);
        });

        it('should throw a NotFoundException if category not found', async () => {
            const id = '1';

            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Category not found!'));

            await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a category', async () => {
            const id = '1';
            const updateCategoryDto: UpdateCategoryDto = { title: 'Updated Food' };
            const updateResult: UpdateResult = {
                affected: 1,
                raw: [],
                generatedMaps: [],
            };

            jest.spyOn(service, 'update').mockResolvedValue(updateResult);

            const response = await controller.update(id, updateCategoryDto);

            expect(response).toEqual(updateResult);
            expect(service.update).toHaveBeenCalledWith(+id, updateCategoryDto);
        });

        it('should throw a NotFoundException if category not found', async () => {
            const id = '1';
            const updateCategoryDto: UpdateCategoryDto = { title: 'Updated Food' };

            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException('Category not found!'));

            await expect(controller.update(id, updateCategoryDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a category', async () => {
            const id = '1';
            const deleteResult: DeleteResult = {
                affected: 1,
                raw: [],
            };

            jest.spyOn(service, 'remove').mockResolvedValue(deleteResult);

            const response = await controller.remove(id);

            expect(response).toEqual(deleteResult);
            expect(service.remove).toHaveBeenCalledWith(+id);
        });

        it('should throw a NotFoundException if category not found', async () => {
            const id = '1';

            jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException('Category not found!'));

            await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
        });
    });
});
