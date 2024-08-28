import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from '../../src/category/category.controller'
import { CategoryService } from '../../src/category/category.service'
import { CreateCategoryDto } from '../../src/category/dto/create-category.dto'
import { UpdateCategoryDto } from '../../src/category/dto/update-category.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { User } from '../../src/user/entities/user.entity'
import { AuthorGuard } from '../../src/guard/author.guard'
import { TransactionService } from '../../src/transaction/transaction.service'

describe('CategoryController', () => {
	let controller: CategoryController
	let service: CategoryService

	const mockUser: User = {
		id: 1,
		email: 'test@test.com',
		password: 'password',
		categories: [],
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockCategoryResult = {
		id: 1,
		title: 'Food',
		user: mockUser,
		transactions: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	interface UpdateResult {
		raw: any
		generatedMaps: any[]
		affected: number
	}

	interface DeleteResult {
		raw: any
		affected: number
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
		}).compile()

		controller = module.get<CategoryController>(CategoryController)
		service = module.get<CategoryService>(CategoryService)
	})

	describe('create', () => {
		it('should create a category', async () => {
			// Arrange
			const createCategoryDto: CreateCategoryDto = { title: 'Food' }
			const expectativa = { user: { id: 1 } }

			jest.spyOn(service, 'create').mockResolvedValue(mockCategoryResult)

			// Act
			const sut = await controller.create(createCategoryDto, expectativa)

			//Assert
			expect(sut).toEqual(mockCategoryResult)
			expect(service.create).toHaveBeenCalledWith(
				createCategoryDto,
				expectativa.user.id,
			)
		})

		it('should throw a BadRequestException if category already exists', async () => {
			//Arrange
			const createCategoryDto: CreateCategoryDto = { title: 'Food' }
			const expectativa = { user: { id: 1 } }

			jest.spyOn(service, 'create').mockRejectedValue(
				new BadRequestException('This category already exists!'),
			)
			//Act & Assert
			await expect(
				controller.create(createCategoryDto, expectativa),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should return an array of categories', async () => {
			//Arrange
			const expectativa = { user: { id: 1 } }
			const categoriesMock = [mockCategoryResult]

			jest.spyOn(service, 'findAll').mockResolvedValue(categoriesMock)
			//Act
			const sut = await controller.findAll(expectativa)
			//Assert
			expect(sut).toEqual(categoriesMock)
			expect(service.findAll).toHaveBeenCalledWith(expectativa.user.id)
		})
	})

	describe('findOne', () => {
		it('should return a category', async () => {
			//arrange
			const id = '1'

			jest.spyOn(service, 'findOne').mockResolvedValue(mockCategoryResult)
			//act
			const sut = await controller.findOne(id)
			//assert
			expect(sut).toEqual(mockCategoryResult)
			expect(service.findOne).toHaveBeenCalledWith(+id)
		})

		it('should throw a NotFoundException if category not found', async () => {
			//arrange
			const id = '1'

			jest.spyOn(service, 'findOne').mockRejectedValue(
				new NotFoundException('Category not found!'),
			)

			// Act & Assert
			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('update', () => {
		it('should update a category', async () => {
			//arrange
			const id = '1'
			const updateCategoryDto: UpdateCategoryDto = {
				title: 'Updated Food',
			}
			const updateResult: UpdateResult = {
				affected: 1,
				raw: [],
				generatedMaps: [],
			}

			jest.spyOn(service, 'update').mockResolvedValue(updateResult)
			//act
			const sut = await controller.update(id, updateCategoryDto)
			//assert
			expect(sut).toEqual(updateResult)
			expect(service.update).toHaveBeenCalledWith(+id, updateCategoryDto)
		})

		it('should throw a NotFoundException if category not found', async () => {
			//arrange
			const id = '1'
			const updateCategoryDto: UpdateCategoryDto = {
				title: 'Updated Food',
			}

			jest.spyOn(service, 'update').mockRejectedValue(
				new NotFoundException('Category not found!'),
			)
			//act & assert
			await expect(
				controller.update(id, updateCategoryDto),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('remove', () => {
		it('should remove a category', async () => {
			//arrange
			const id = '1'
			const deleteResult: DeleteResult = {
				affected: 1,
				raw: [],
			}

			jest.spyOn(service, 'remove').mockResolvedValue(deleteResult)
			//act
			const sut = await controller.remove(id)
			//assert
			expect(sut).toEqual(deleteResult)
			expect(service.remove).toHaveBeenCalledWith(+id)
		})

		it('should throw a NotFoundException if category not found', async () => {
			//arrange
			const id = '1'

			jest.spyOn(service, 'remove').mockRejectedValue(
				new NotFoundException('Category not found!'),
			)
			//act & assert
			await expect(controller.remove(id)).rejects.toThrow(
				NotFoundException,
			)
		})
	})
})
