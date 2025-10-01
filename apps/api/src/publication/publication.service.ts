import { Injectable, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Publication, PublicationDocument } from "../publication/publication.schema";


@Injectable()
/**
 * Service responsable de la gestion des opérations liées aux publications.
 *
 * Fournit des méthodes pour récupérer, créer, mettre à jour et supprimer des publications
 * en utilisant le modèle Mongoose injecté.
 * 
 */
export class PublicationService {

    /**
     * Crée une instance de PublicationService.
     * @param publicationModel Modèle Mongoose injecté pour interagir avec la collection des publications.
     */
    constructor(@InjectModel(Publication.name) private publicationModel: Model<PublicationDocument>) {}

    /**
     *  Normalise un objet publication en s'assurant que les références d'utilisateur et de prédiction sont des chaînes.
     * @param pub publication à normaliser
     * @returns la publication normalisée
     */
    private normalizePub(pub: any) {
        const obj = typeof pub.toObject === 'function' ? pub.toObject() : { ...pub };
        if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) obj.user_id = String(obj.user_id._id);
        if (obj.user && typeof obj.user === 'object' && obj.user._id) obj.user_id = String(obj.user._id);
        if (obj.prediction_id && typeof obj.prediction_id === 'object' && obj.prediction_id._id) obj.prediction_id = String(obj.prediction_id._id);
        return obj;
    }

    /**
     * Récupère toutes les publications disponibles.
     * @returns Une promesse avec un tableau de publications
     */
    async getAll(): Promise<Publication[]> {
        const pubs = await this.publicationModel.find().populate('user_id', 'username').populate('prediction_id', 'title').exec();
        return (pubs as any[]).map((d) => this.normalizePub(d));
    }

    /**
     * Récupère une publication par son identifiant.
     * @param id Identifiant de la publication à récupérer.
     * @returns Une promesse avec la publication ou undefined si elle n'existe pas.
     */
    async getById(id: string): Promise<Publication | undefined> {
        const pub = await this.publicationModel.findById(id).populate('user_id', 'username').populate('prediction_id', 'title').exec() ?? undefined;
        if (!pub) return undefined;
        return this.normalizePub(pub) as Publication;
    }

    /**
     * Crée une nouvelle publication.
     * @param pub publication à créer
     * @returns Une promesse avec la publication créée
     */
    async createPublication(pub: Publication): Promise<Publication> {
        const safePub = { ...pub } as any;
        const newPub = new this.publicationModel(safePub);
        const created = await newPub.save();
        return this.normalizePub(created) as Publication;
    }

    /**
     * Met à jour une publication si elle existe, sinon la crée.
     * @param id Identifiant de la publication à créer ou mettre à jour
     * @param pub Publication à créer ou mettre à jour
     * @returns Une promesse avec la publication créée ou mise à jour
     */
    async createOrUpdateById(id: string, pub: Publication): Promise<Publication> {
        const existing = await this.publicationModel.findById(id).exec();
        if (existing) {
            existing.message = pub.message ?? existing.message;
            existing.datePublication = pub.datePublication ?? existing.datePublication;
            existing.prediction_id = pub.prediction_id ?? existing.prediction_id;
            existing.parentPublication_id = pub.parentPublication_id ?? existing.parentPublication_id;
            existing.user_id = pub.user_id ?? existing.user_id;
            existing.likes = pub.likes ?? existing.likes;
            return await existing.save();
        } else {
            const toCreate = { ...pub } as any;
            const newPub = new this.publicationModel(toCreate);
            const created = await newPub.save();
            return this.normalizePub(created) as Publication;
        }
    }

    /**
     * Supprime une publication par son identifiant.
     * @param id Identifiant de la publication à supprimer
     * @returns Une promesse avec la publication supprimée.
     * @throws Error si la publication n'est pas trouvée
     */
    async deleteById(id: string): Promise<Publication> {
        const deleted = await this.publicationModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new Error('Publication introuvable');
        }
        return this.normalizePub(deleted) as Publication;
    }

    /**
     * Permet à un utilisateur de liker ou unliker une publication.
     * @param pubId Identifiant de la publication à liker ou unliker.
     * @param userId Identifiant de l'utilisateur qui like ou unlike la publication.
     * @returns Une promesse avec la publication mise à jour.
     * @throws Error si la publication n'est pas trouvée.
     */
    async toggleLikePublication(pubId: string, userId: string): Promise<Publication> {
        const publication = await this.publicationModel.findById(pubId).exec();
        if (!publication) throw new Error('Publication introuvable');

        const userObjectId = new Types.ObjectId(userId);
        if (publication.likes && publication.likes.filter(id => id.equals(userObjectId)).length > 0) { // Retirer le like
            publication.likes = publication.likes.filter(id => !id.equals(userObjectId));
        } else {    // Ajouter le like
            publication.likes.push(userObjectId);
        }

        await publication.save();
        return this.normalizePub(publication) as Publication;
    }
}