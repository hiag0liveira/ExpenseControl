import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from '../../src/transaction/transaction.controller'
import { TransactionService } from '../../src/transaction/transaction.service'
import { CreateTransactionDto } from '../../src/transaction/dto/create-transaction.dto'
import { UpdateTransactionDto } from '../../src/transaction/dto/update-transaction.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard'
import { AuthorGuard } from '../../src/guard/author.guard'
import { Category } from '../../src/category/entities/category.entity'
import { User } from '../../src/user/entities/user.entity'
import { Transaction } from '../../src/transaction/entities/transaction.entity'

describe('TransactionController', () => {
	let controller: TransactionController
	let service: TransactionService

	const mockUser: User = {
		id: 1,
		email: 'test@test.com',
		password: 'password',
		categories: [],
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockCategory: Category = {
		id: 1,
		title: 'Food',
		user: mockUser,
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockTransaction: Transaction = {
		id: 1,
		title: 'food',
		amount: 42,
		type: 'expense',
		category: mockCategory,
		user: mockUser,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const updateResult = { affected: 1, raw: [], generatedMaps: [] }
	const deleteResult = { affected: 1, raw: [] }

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
						findAllByType: jest
							.fn()
							.mockResolvedValue([mockTransaction]),
						findAllWithPagination: jest
							.fn()
							.mockResolvedValue([mockTransaction]),
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
			.compile()

		controller = module.get<TransactionController>(TransactionController)
		service = module.get<TransactionService>(TransactionService)
	})

	describe('create', () => {
		it('should create a transaction', async () => {
			//arrange
			const dto: CreateTransactionDto = {
				title: 'Salário',
				amount: 100,
				type: 'income',
				category: mockCategory,
			}
			const expectativa = { user: mockUser }
			//act
			const sut = await controller.create(dto, expectativa)
			//assert
			expect(sut).toEqual(mockTransaction)
			expect(service.create).toHaveBeenCalledWith(dto, mockUser.id)
		})

		it('should throw a BadRequestException if transaction creation fails', async () => {
			//arrange
			const dto: CreateTransactionDto = {
				title: 'Salário',
				amount: 100,
				type: 'income',
				category: mockCategory,
			}
			const expectativa = { user: mockUser }

			jest.spyOn(service, 'create').mockRejectedValue(
				new BadRequestException('Transaction creation failed'),
			)
			//act & assert
			await expect(controller.create(dto, expectativa)).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('update', () => {
		it('should update a transaction', async () => {
			//arrange
			const dto: UpdateTransactionDto = {
				title: 'Updated Food',
				amount: 200,
			}
			const id = '1'
			//act
			const sut = await controller.update(id, dto)
			//assert
			expect(sut).toEqual(updateResult)
			expect(service.update).toHaveBeenCalledWith(+id, dto)
		})

		it('should throw a NotFoundException if transaction not found', async () => {
			//arrange
			const dto: UpdateTransactionDto = {
				title: 'Updated Food',
				amount: 200,
			}
			const id = '1'

			jest.spyOn(service, 'update').mockRejectedValue(
				new NotFoundException('Transaction not found'),
			)
			//act & assert
			await expect(controller.update(id, dto)).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('remove', () => {
		it('should remove a transaction', async () => {
			//arrange
			const id = '1'
			//act
			const result = await controller.remove(id)
			//assert
			expect(result).toEqual(deleteResult)
			expect(service.remove).toHaveBeenCalledWith(+id)
		})

		it('should throw a NotFoundException if transaction not found', async () => {
			//arrange
			const id = '1'

			jest.spyOn(service, 'remove').mockRejectedValue(
				new NotFoundException('Transaction not found'),
			)
			//act & assert
			await expect(controller.remove(id)).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('findAllByType', () => {
		it('should return all transactions of a specific type', async () => {
			//arrange
			const expectativa = { user: mockUser }
			const type = 'income'
			//act
			const sut = await controller.findAllByType(expectativa, type)
			//assert
			expect(sut).toEqual([mockTransaction])
			expect(service.findAllByType).toHaveBeenCalledWith(
				mockUser.id,
				type,
			)
		})
	})

	describe('findAllWithPagination', () => {
		it('should return transactions with pagination', async () => {
			//arrange
			const expectativa = { user: mockUser }
			//act
			const sut = await controller.findAllWithPagination(
				expectativa,
				1,
				3,
			)
			//assert
			expect(sut).toEqual([mockTransaction])
			expect(service.findAllWithPagination).toHaveBeenCalledWith(
				mockUser.id,
				1,
				3,
			)
		})
	})

	describe('findAll', () => {
		it('should return all transactions', async () => {
			//arrange
			const expectativa = { user: mockUser }
			//act
			const sut = await controller.findAll(expectativa)
			//assert
			expect(sut).toEqual([mockTransaction])
			expect(service.findAll).toHaveBeenCalledWith(mockUser.id)
		})
	})

	describe('findOne', () => {
		it('should return a single transaction', async () => {
			//arrange
			const id = '1'
			//act
			const sut = await controller.findOne(id)
			//assert
			expect(sut).toEqual(mockTransaction)
			expect(service.findOne).toHaveBeenCalledWith(+id)
		})

		it('should throw a NotFoundException if transaction not found', async () => {
			//arrange
			const id = '1'

			jest.spyOn(service, 'findOne').mockRejectedValue(
				new NotFoundException('Transaction not found'),
			)

			//act & assert
			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException,
			)
		})
	})
})
