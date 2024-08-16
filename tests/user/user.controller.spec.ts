import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;

    // Configuração do módulo de teste
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn().mockResolvedValue({ id: 1, ...CreateUserDto }),
                    },
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    // Teste para verificar se o controlador está definido
    it('should be defined', () => {
        // Arrange: Nenhuma preparação adicional necessária

        // Act: Nenhuma ação específica, apenas verificar a definição

        // Assert: Verifique se o controlador está definido
        expect(userController).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            // Arrange (setup): Preparar os dados e mocks
            const createUserDto: CreateUserDto = {
                email: 'johndoe@example.com',
                password: 'password123',
            };

            // Act: Chamar o método `create` do controlador
            const result = await userController.create(createUserDto);

            // Assert (tratar a expectativa): Verificar os resultados e o comportamento
            expect(result).toEqual({ id: 1 });
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
        });
    });
});
