import { AuthorGuard } from '../../src/guard/author.guard';
import { BadRequestException, ExecutionContext, NotFoundException } from '@nestjs/common';
import { TransactionService } from '../../src/transaction/transaction.service';
import { CategoryService } from '../../src/category/category.service';
import { Repository } from 'typeorm';
import { Transaction } from '../../src/transaction/entities/transaction.entity';
import { Category } from '../../src/category/entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Test } from '@nestjs/testing';

describe('AuthorGuard', () => {
    let guard: AuthorGuard;
    let transactionService: TransactionService;
    let categoryService: CategoryService;
    let transactionRepository: Repository<Transaction>;
    let categoryRepository: Repository<Category>;

    const user: User = {
        id: 1,
        email: 'test@test.com',
        password: 'password',
        categories: [],
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const category: Category = {
        id: 1,
        title: 'Food',
        user: user,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const transaction: Transaction = {
        id: 1,
        title: 'food',
        amount: 42,
        type: 'expense',
        category: category,
        user: user,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthorGuard,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Category),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                TransactionService,
                CategoryService,
            ],
        }).compile();

        guard = moduleRef.get<AuthorGuard>(AuthorGuard);
        transactionService = moduleRef.get<TransactionService>(TransactionService);
        categoryService = moduleRef.get<CategoryService>(CategoryService);
        transactionRepository = moduleRef.get<Repository<Transaction>>(getRepositoryToken(Transaction));
        categoryRepository = moduleRef.get<Repository<Category>>(getRepositoryToken(Category));
    });

    it('should allow access when the user is the author of the transaction', async () => {
        const mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: 1 },
                    params: { id: '1', type: 'transaction' },
                }),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(transactionService, 'findOne').mockResolvedValue(transaction);

        const result = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
    });

    it('should allow access when the user is the author of the category', async () => {
        const mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: 1 },
                    params: { id: '1', type: 'category' },
                }),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(categoryService, 'findOne').mockResolvedValue(category);

        const result = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
    });

    it('should throw a NotFoundException for an invalid type', async () => {
        const mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: 1 },
                    params: { id: '1', type: 'invalidType' },
                }),
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException if the user is not the author', async () => {
        const mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: 1 },
                    params: { id: '1', type: 'transaction' },
                }),
            }),
        } as unknown as ExecutionContext;

        // Mocking the transaction with a different user
        const mockTransaction = {
            ...transaction,
            user: {
                ...user,  // Keeping the rest of the user properties intact
                id: 2,    // Changing the ID to simulate a different user
            }
        };

        jest.spyOn(transactionService, 'findOne').mockResolvedValue(mockTransaction);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(BadRequestException);
    });
    it('should throw a BadRequestException if the entity is not found', async () => {
        const mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: 1 },
                    params: { id: '1', type: 'transaction' },
                }),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(transactionService, 'findOne').mockResolvedValue(null);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(BadRequestException);
    });

});
