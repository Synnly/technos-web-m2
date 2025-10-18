import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Req,
	UnauthorizedException,
	UseGuards,
	ValidationPipe,
} from "@nestjs/common";
import { Role, User, UserDocument } from "../user/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { CosmeticService } from "../cosmetic/cosmetic.service";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "../guards/admin.guard";
import { UserDto } from "./dto/user.dto";
import { CreateUserDto } from "./dto/createuser.dto";
import { UpdateUserDto } from "./dto/updateuser.dto";

/**
 * Contrôleur pour gérer les opérations liées aux utilisateurs.
 */
@Controller("/api/user")
export class UserController {
	/**
	 * Constructeur pour UserController.
	 * @param userService - Service pour la logique métier liée aux utilisateurs.
	 * @param jwtService - Service pour gérer les opérations JWT.
	 * @param cosmeticService - Service pour la logique métier liée aux cosmétiques.
	 * @param userModel - Modèle Mongoose pour les utilisateurs.
	 */
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,
		private cosmeticService: CosmeticService,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}

	/**
	 * Récupère tous les utilisateurs.
	 * @returns La liste des DTOs de tous les utilisateur.
	 * @throws {ForbiddenException} si l'utilisateur authentifié n'a pas la permission d'accéder à cette ressource.
	 */
	@UseGuards(AuthGuard, AdminGuard)
	@Get("")
	async getUsers(): Promise<UserDto[]> {
		const users = await this.userService.getAll();
		return users.map((user) => new UserDto(user));
	}

		/**
	 * Récupère la récompense quotidienne pour un utilisateur.
	 * @param request la requête HTTP contenant l'utilisateur authentifié
	 * @returns un objet contenant la récompense quotidienne
	 * @throws {BadRequestException} si le nom d'utilisateur est invalide ou si la récupération de la récompense échoue.
	 */
	@UseGuards(AuthGuard)
	@Get("/daily-reward")
	async getDailyReward(@Req() request) {
		try {
			const reward = await this.userService.claimDailyReward(request.user.username);
			return { reward: reward };
		} catch (error) {
			throw new BadRequestException({
				message: error.message || "Échec de la récupération de la récompense quotidienne",
			});
		}
	}

	/**
	 * Récupère un utilisateur par son nom d'utilisateur.
	 * @param request L'objet de requête HTTP contenant les informations de l'utilisateur authentifié.
	 * @param username Le nom d'utilisateur de l'utilisateur à récupérer.
	 * @returns Les données de l'utilisateur
	 * @throws {BadRequestException} si le nom d'utilisateur est manquant.
	 * @throws {NotFoundException} si l'utilisateur n'existe pas.
	 * @throws {ForbiddenException} si l'utilisateur authentifié n'a pas la
	 * permission d'accéder aux données de l'utilisateur demandé.
	 */
	@UseGuards(AuthGuard)
	@Get("/{:username}")
	async getUserByUsername(@Req() request, @Param("username") username: string): Promise<UserDto> {
		if (username === undefined || username === null) {
			throw new BadRequestException({ message: "Le nom d'utilisateur est requis" });
		}

		if (request.user.username !== username && request.user.role !== Role.ADMIN) throw new ForbiddenException();

		const user = await this.userService.getByUsername(username);
		if (!user) throw new NotFoundException({ message: "L'utilisateur n'est pas trouvable" });

		return new UserDto(user);
	}

	/**
	 * Crée un nouvel utilisateur.
	 * @param createUserDto Les données du nouvel utilisateur à créer.
	 * @returns Les données de l'utilisateur créé.
	 * @throws {BadRequestException} si les données de l'utilisateur sont invalides.
	 */
	@Post("")
	@HttpCode(201)
	async createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
		if (!createUserDto) throw new BadRequestException({ message: "L'utilisateur est requis" });
		try {
			await this.userService.createUser(createUserDto);
		} catch (error) {
			throw new BadRequestException({ message: error.message });
		}
	}

	/**
	 * Met à jour un utilisateur par son nom d'utilisateur.
	 * @param request L'objet de requête HTTP contenant les informations de l'utilisateur authentifié.
	 * @param username Le nom d'utilisateur de l'utilisateur à mettre à jour.
	 * @param updateUserDto Les données mises à jour de l'utilisateur.
	 * @throws {BadRequestException} si le nom d'utilisateur ou les données mises à jour sont invalides.
	 * @throws {ForbiddenException} si l'utilisateur authentifié n'a pas la permission de modifier cet utilisateur.
	 */
	@UseGuards(AuthGuard)
	@Put("/{:username}")
	async updateUserByUsername(
		@Req() request,
		@Param("username") username: string,
		@Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
	) {
		if (request.user && request.user.username !== username && request.user.role !== Role.ADMIN) {
			throw new ForbiddenException();
		}

		if (!username) throw new BadRequestException({ message: "Le nom d'utilisateur est requis" });
		if (!updateUserDto) throw new BadRequestException({ message: "L'utilisateur est requis" });

		if (request.user.role !== Role.ADMIN && request.user.username !== username) {
			throw new ForbiddenException({
				message: "Vous n'avez pas la permission de modifier cet utilisateur.",
			});
		}

		try {
			let newUpdateUserDto: UpdateUserDto;
			if (request.user.role !== Role.ADMIN) {
				newUpdateUserDto = new UpdateUserDto({ motDePasse: updateUserDto.motDePasse });
			} else {
				newUpdateUserDto = updateUserDto;
			}
			await this.userService.createOrUpdateByUsername(username, newUpdateUserDto);

			if (await this.userService.createOrUpdateByUsername(username, newUpdateUserDto)) {
				return { statusCode: 201 };
			} else {
				return { statusCode: 200 };
			}
		} catch (error) {
			throw new BadRequestException({ message: error.message });
		}
	}

	/**
	 * Supprime un utilisateur par son nom d'utilisateur.
	 * @param request L'objet de requête HTTP contenant les informations de l'utilisateur authentifié.
	 * @param username Le nom d'utilisateur de l'utilisateur à supprimer.
	 * @throws {BadRequestException} si le nom d'utilisateur est invalide.
	 * @throws {NotFoundException} si l'utilisateur n'existe pas.
	 * @throws {ForbiddenException} si l'utilisateur authentifié n'a pas la permission de supprimer cet utilisateur.
	 */
	@UseGuards(AuthGuard)
	@Delete("/{:username}")
	async deleteUser(@Req() request, @Param("username") username: string) {
		if (!username) throw new BadRequestException({ message: "Le nom d'utilisateur est requis" });
		if (request.user.role !== Role.ADMIN && request.user.username !== username) {
			throw new ForbiddenException();
		}

		try {
			await this.userService.deleteByUsername(username);
		} catch (error) {
			throw new NotFoundException({ message: error.message });
		}
	}

	/**
	 * Authentifie un utilisateur et génère un token JWT.
	 * @param credentials Les informations d'identification de l'utilisateur (nom d'utilisateur et mot de passe).
	 * @returns Un objet contenant le token JWT si l'authentification est réussie.
	 * @throws {BadRequestException} si les informations d'identification sont invalides.
	 * @throws {UnauthorizedException} si l'authentification échoue.
	 */
	@Post("/login")
	async login(@Body() credentials: { username: string; password: string }) {
		if (!credentials.username) throw new BadRequestException({ message: "Le nom d'utilisateur est requis" });
		if (!credentials.password) throw new BadRequestException({ message: "Le mot de passe est requis" });

		try {
			const token = await this.userService.getJwtToken(
				credentials.username,
				credentials.password,
				this.jwtService,
			);
			return { token: token };
		} catch (error) {
			throw new UnauthorizedException({ message: error.message || "Échec de l'authentification" });
		}
	}

	/**
	 * Achat d'un cosmétique par un utilisateur.
	 * @param cosmeticId l'identifiant du cosmétique à acheter
	 * @param username le nom d'utilisateur de l'acheteur
	 * @param request la requête HTTP contenant l'utilisateur authentifié
	 * @returns les données de l'utilisateur mis à jour après l'achat
	 * @throws {BadRequestException} si l'identifiant du cosmétique est invalide.
	 * @throws {BadRequestException} si l'utilisateur possède déjà le cosmétique.
	 * @throws {BadRequestException} si l'utilisateur n'a pas assez de points pour acheter le cosmétique.
	 * @throws {NotFoundException} si l'utilisateur n'existe pas.
	 * @throws {NotFoundException} si le cosmétique n'existe pas.
	 * @throws {ForbiddenException} si l'utilisateur authentifié ne correspond pas à l'acheteur.
	 */
	@UseGuards(AuthGuard)
	@Post("/:username/buy/cosmetic/:cosmeticId")
	async buyCosmetic(@Req() request, @Param("cosmeticId") cosmeticId: string, @Param("username") username) {
		if (request.user.username !== username)
			throw new ForbiddenException({ message: "Vous n'avez pas la permission" });

		if (!cosmeticId) throw new BadRequestException({ message: "L'identifiant du cosmétique est requis" });

		const user = await this.userService.getByUsername(username);
		if (!user) throw new NotFoundException({ message: "L'utilisateur n'est pas trouvable" });

		const cosmetic = await this.cosmeticService.findById(cosmeticId);
		if (!cosmetic) throw new NotFoundException({ message: "Le cosmétique n'est pas trouvable" });

		try {
			await this.userService.buyCosmetic(username, cosmetic);
		} catch (error) {
			throw new BadRequestException({ message: error.message });
		}
	}
}
