import { JwtService } from '@nestjs/jwt'
import { User } from '../../src/user/entities/user.entity'
import { UserService } from '../../src/user/user.service'
import { Repository } from 'typeorm'

describe('UserService', () => {
	let service: UserService
	let mockUserRepository: Repository<User>
	let mockJwtService: JwtService

	beforeEach(async () => {
		mockUserRepository = {
			findOne: jest.fn(),
			save: jest.fn(),
		} as any as Repository<User>

		mockJwtService = {
			sign: jest.fn(),
			verify: jest.fn(),
			decode: jest.fn(),
		} as any as JwtService

		service = new UserService(mockUserRepository, mockJwtService)
	})

	describe('create', () => {
		it('should thrown an exception when the user already exists', async () => {
			const createUserDto = {
				email: 'test@test.com',
				password: 'password',
			}

			const user: User = {
				id: 1,
				email: 'test@test.com',
				password: 'password',
				categories: [],
				transactions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockUserRepository.findOne = jest.fn().mockResolvedValue(user)

			await expect(service.create(createUserDto)).rejects.toThrowError()
		})

		it('should return a user and a token', async () => {
			const createUserDto = {
				email: 'test@test.com',
				password: 'password',
			}

			const user: User = {
				id: 1,
				email: 'test@test.com',
				password: 'password',
				categories: [],
				transactions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockUserRepository.findOne = jest.fn().mockResolvedValue(null)
			mockUserRepository.save = jest.fn().mockResolvedValue(user)
			mockJwtService.sign = jest.fn().mockReturnValue('token')

			const result = await service.create(createUserDto)

			expect(result).toEqual({
				user: user,
				token: 'token',
			})
		})
	})

	describe('findOne', () => {
		it('should return a user', async () => {
			const user: User = {
				id: 1,
				email: 'test@test.com',
				password: 'password',
				categories: [],
				transactions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			;(mockUserRepository.findOne as jest.Mock).mockResolvedValue(user)

			const result = await service.findOne('test@test.com')

			expect(result).toEqual(user)
		})
	})
})
