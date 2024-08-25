import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../src/transaction/transaction.controller';
import { TransactionService } from '../../src/transaction/transaction.service';
import { CreateTransactionDto } from '../../src/transaction/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../src/transaction/dto/update-transaction.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { AuthorGuard } from '../../src/guard/author.guard';
import { Category } from '../../src/category/entities/category.entity';
import { User } from '../../src/user/entities/user.entity';
import { Transaction } from '../../src/transaction/entities/transaction.entity';

describe('TransactionController', () => {
    let controller: TransactionController;
    let service: TransactionService;

    const mockUser: User = {
        id: 1,
        email: 'test@test.com',
        password: 'password',
        categories: [],
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockCategory: Category = {
        id: 1,
        title: 'Food',
        user: mockUser,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTransaction: Transaction = {
        id: 1,
        title: 'food',
        amount: 42,
        type: 'expense',
        category: mockCategory,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const updateResult = { affected: 1, raw: [], generatedMaps: [] };
    const deleteResult = { affected: 1, raw: [] };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
            providers: [
                {
                    provide: TransactionService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockTransaction),
                        update: jest.fn().mockResolvedValue(updateResult),
                        remove: jest.fn().mockResolvedValue(deleteResult),
                        findAllByType: jest.fn().mockResolvedValue([mockTransaction]),
                        findAllWithPagination: jest.fn().mockResolvedValue([mockTransaction]),
                        findAll: jest.fn().mockResolvedValue([mockTransaction]),
                        findOne: jest.fn().mockResolvedValue(mockTransaction),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(AuthorGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<TransactionController>(TransactionController);
        service = module.get<TransactionService>(TransactionService);
    });

    describe('create', () => {
        it('should create a transaction', async () => {
            const dto: CreateTransactionDto = { title: 'Salário', amount: 100, type: 'income', category: mockCategory };
            const req = { user: mockUser };

            const result = await controller.create(dto, req);

            expect(result).toEqual(mockTransaction);
            expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
        });

        it('should throw a BadRequestException if transaction creation fails', async () => {
            const dto: CreateTransactionDto = { title: 'Salário', amount: 100, type: 'income', category: mockCategory };
            const req = { user: mockUser };

            jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('Transaction creation failed'));

            await expect(controller.create(dto, req)).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        it('should update a transaction', async () => {
            const dto: UpdateTransactionDto = { title: 'Updated Food', amount: 200 };
            const id = '1';

            const result = await controller.update(id, dto);

            expect(result).toEqual(updateResult);
            expect(service.update).toHaveBeenCalledWith(+id, dto);
        });

        it('should throw a NotFoundException if transaction not found', async () => {
            const dto: UpdateTransactionDto = { title: 'Updated Food', amount: 200 };
            const id = '1';

            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException('Transaction not found'));

            await expect(controller.update(id, dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a transaction', async () => {
            const id = '1';

            const result = await controller.remove(id);

            expect(result).toEqual(deleteResult);
            expect(service.remove).toHaveBeenCalledWith(+id);
        });

        it('should throw a NotFoundException if transaction not found', async () => {
            const id = '1';

            jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException('Transaction not found'));

            await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllByType', () => {
        it('should return all transactions of a specific type', async () => {
            const req = { user: mockUser };
            const type = 'income';

            const result = await controller.findAllByType(req, type);

            expect(result).toEqual([mockTransaction]);
            expect(service.findAllByType).toHaveBeenCalledWith(mockUser.id, type);
        });
    });

    describe('findAllWithPagination', () => {
        it('should return transactions with pagination', async () => {
            const req = { user: mockUser };

            const result = await controller.findAllWithPagination(req, 1, 3);

            expect(result).toEqual([mockTransaction]);
            expect(service.findAllWithPagination).toHaveBeenCalledWith(mockUser.id, 1, 3);
        });
    });

    describe('findAll', () => {
        it('should return all transactions', async () => {
            const req = { user: mockUser };

            const result = await controller.findAll(req);

            expect(result).toEqual([mockTransaction]);
            expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findOne', () => {
        it('should return a single transaction', async () => {
            const id = '1';

            const result = await controller.findOne(id);

            expect(result).toEqual(mockTransaction);
            expect(service.findOne).toHaveBeenCalledWith(+id);
        });

        it('should throw a NotFoundException if transaction not found', async () => {
            const id = '1';

            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Transaction not found'));

            await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
        });
    });
});
