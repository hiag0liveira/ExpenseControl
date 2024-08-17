import { CreateUserDto } from '../../src/user/dto/create-user.dto'
import { UserController } from '../../src/user/user.controller'
import { UserService } from '../../src/user/user.service'

describe('UserController', () => {
	let userController: UserController
	let userService: UserService

	// Configuração do módulo de teste
	beforeEach(async () => {
		userService = {
			create: jest.fn(),
		} as any as UserService

		userController = new UserController(userService)
	})

	// Teste para verificar se o controlador está definido
	it('should be defined', () => {
		// Arrange: Nenhuma preparação adicional necessária

		// Act: Nenhuma ação específica, apenas verificar a definição

		// Assert: Verifique se o controlador está definido
		expect(userController).toBeDefined()
	})

	describe('create', () => {
		it('should create a user', async () => {
			// Arrange (setup): Preparar os dados e mocks
			const createUserDto: CreateUserDto = {
				email: 'johndoe@example.com',
				password: 'password123',
			}

			userService.create = jest.fn().mockResolvedValue({ id: 1 })

			// Act: Chamar o método `create` do controlador
			const result = await userController.create(createUserDto)

			// Assert (tratar a expectativa): Verificar os resultados e o comportamento
			expect(result).toEqual({ id: 1 })
			expect(userService.create).toHaveBeenCalledWith(createUserDto)
		})
	})
})
