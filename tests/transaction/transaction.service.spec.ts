import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../src/category/entities/category.entity'
import { CreateTransactionDto } from '../../src/transaction/dto/create-transaction.dto'
import { UpdateTransactionDto } from '../../src/transaction/dto/update-transaction.dto'
import { Transaction } from '../../src/transaction/entities/transaction.entity'
import { TransactionService } from '../../src/transaction/transaction.service'
import { User } from '../../src/user/entities/user.entity'
import { use } from 'passport'

describe('TransactionService', () => {
	let service: TransactionService
	let transactionRepository: Repository<Transaction>

	const userMock: User = {
		id: 1,
		email: 'test@test.com',
		password: 'password',
		categories: [],
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const categoryMock: Category = {
		id: 1,
		title: 'Food',
		user: userMock,
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const transactionMock: Transaction = {
		id: 1,
		title: 'Food',
		amount: 100,
		type: 'expense',
		category: categoryMock,
		user: userMock,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransactionService,
				{
					provide: getRepositoryToken(Transaction),
					useValue: {
						findOne: jest.fn(),
						find: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
						delete: jest.fn(),
					},
				},
			],
		}).compile()

		service = module.get<TransactionService>(TransactionService)
		transactionRepository = module.get<Repository<Transaction>>(
			getRepositoryToken(Transaction),
		)
	})
	describe('create', () => {
		it('should throw a BadRequestException if save returns null', async () => {
			//arrange
			const createTransactionDto: CreateTransactionDto = {
				title: 'New Transaction',
				amount: 200,
				type: 'income',
				category: categoryMock,
			}

			// Aqui estamos simulando que o método save retorna null, o que deve resultar em uma exceção.
			jest.spyOn(transactionRepository, 'save').mockResolvedValue(null)

			//act & assert
			// Esperamos que o serviço lance uma exceção do tipo BadRequestException.
			await expect(
				service.create(createTransactionDto, 1),
			).rejects.toThrow(BadRequestException)
		})

		it('should create a transaction successfully', async () => {
			//arrange
			const createTransactionDto: CreateTransactionDto = {
				title: 'New Transaction',
				amount: 200,
				type: 'income',
				category: categoryMock,
			}

			const savedTransaction = {
				id: 1,
				title: 'New Transaction 2',
				amount: 200,
				type: 'income',
				category: categoryMock,
				user: userMock,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			jest.spyOn(transactionRepository, 'save').mockResolvedValue(
				savedTransaction,
			)
			//act
			const sut = await service.create(createTransactionDto, 1)
			//assert
			expect(sut).toEqual(savedTransaction)
		})
	})

	describe('findOne', () => {
		it('should return a transaction', async () => {
			//arrange
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(
				transactionMock,
			)

			//act
			const sut = await service.findOne(1)

			//assert
			expect(sut).toEqual(transactionMock)
		})

		it('should throw a NotFoundException if transaction is not found', async () => {
			//arrange
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null)
			//act & assert
			await expect(service.findOne(1)).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('update', () => {
		it('should update the transaction if it exists', async () => {
			//arrange
			const updateTransactionDto: UpdateTransactionDto = {
				title: 'Updated Food',
			}
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(
				transactionMock,
			)
			jest.spyOn(transactionRepository, 'update').mockResolvedValue({
				affected: 1,
				raw: [],
				generatedMaps: [],
			})

			//act
			const sut = await service.update(1, updateTransactionDto)

			//assert
			expect(sut).toEqual({ affected: 1, raw: [], generatedMaps: [] })
			expect(transactionRepository.update).toHaveBeenCalledWith(
				1,
				updateTransactionDto,
			)
		})

		it('should throw a NotFoundException if transaction not found', async () => {
			//arrange
			const updateTransactionDto: UpdateTransactionDto = {
				title: 'Updated Food',
			}
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null)

			//act & assert
			await expect(
				service.update(1, updateTransactionDto),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('remove', () => {
		it('should remove the transaction if it exists', async () => {
			//arrange
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(
				transactionMock,
			)
			jest.spyOn(transactionRepository, 'delete').mockResolvedValue({
				affected: 1,
				raw: [],
			})
			//act
			const sut = await service.remove(1)
			//assert
			expect(sut).toEqual({ affected: 1, raw: [] })
			expect(transactionRepository.delete).toHaveBeenCalledWith(1)
		})

		it('should throw a NotFoundException if transaction not found', async () => {
			//arrange
			jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null)
			//act & assert
			await expect(service.remove(1)).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should return an array of transactions', async () => {
			//arrange
			const transactions = [transactionMock]

			jest.spyOn(transactionRepository, 'find').mockResolvedValue(
				transactions,
			)
			//act
			const sut = await service.findAll(1)

			//assert
			expect(sut).toEqual(transactions)
			expect(transactionRepository.find).toHaveBeenCalledWith({
				where: { user: { id: 1 } },
				relations: { category: true },
				order: { createdAt: 'DESC' },
			})
		})
	})

	describe('findAllWithPagination', () => {
		it('should return an array of transactions with pagination', async () => {
			//arrange
			const transactions = [transactionMock]
			jest.spyOn(transactionRepository, 'find').mockResolvedValue(
				transactions,
			)
			//act
			const sut = await service.findAllWithPagination(1, 1, 10)
			//assert
			expect(sut).toEqual(transactions)
			expect(transactionRepository.find).toHaveBeenCalledWith({
				where: { user: { id: 1 } },
				relations: { category: true, user: true },
				order: { createdAt: 'DESC' },
				take: 10,
				skip: 0,
			})
		})
	})

	describe('findAllByType', () => {
		it('should return the total amount of transactions of a specific type', async () => {
			//arrange
			const transactions = [transactionMock]
			jest.spyOn(transactionRepository, 'find').mockResolvedValue(
				transactions,
			)
			//act
			const sut = await service.findAllByType(1, 'expense')
			//assert
			expect(sut).toEqual(100)
			expect(transactionRepository.find).toHaveBeenCalledWith({
				where: { user: { id: 1 }, type: 'expense' },
			})
		})
	})
})
