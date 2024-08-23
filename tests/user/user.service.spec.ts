import { JwtService } from '@nestjs/jwt'
import { User } from '../../src/user/entities/user.entity'
import { UserService } from '../../src/user/user.service'
import { Repository } from 'typeorm'

describe('UserService', () => {
	let service: UserService
	let mockUserRepository: Repository<User>
	let mockJwtService: JwtService

	beforeEach(async () => {
		// Arrange: Configuração dos mocks necessários para os testes
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
		it('should throw an exception when the user already exists', async () => {
			// Arrange: Configuração do DTO e do usuário já existente
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

			// Act: Tentativa de criar o usuário
			// Assert: Verificação se a exceção é lançada
			await expect(service.create(createUserDto)).rejects.toThrowError()
		})

		it('should return a user and a token', async () => {
			// Arrange: Configuração do DTO e do retorno esperado para um novo usuário
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

			// Act: Chamada do método create
			const result = await service.create(createUserDto)

			// Assert: Verificação do retorno do método
			expect(result).toEqual({
				user: user,
				token: 'token',
			})
		})
	})

	describe('findOne', () => {
		it('should return a user', async () => {
			// Arrange: Configuração do usuário esperado
			const user: User = {
				id: 1,
				email: 'test@test.com',
				password: 'password',
				categories: [],
				transactions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

				; (mockUserRepository.findOne as jest.Mock).mockResolvedValue(user)

			// Act: Chamada do método findOne
			const result = await service.findOne('test@test.com')

			// Assert: Verificação do retorno do método
			expect(result).toEqual(user)
		})
	})
})
