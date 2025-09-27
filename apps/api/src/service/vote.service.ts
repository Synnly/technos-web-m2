import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prediction, PredictionDocument } from "../model/prediction.schema";
import { User, UserDocument } from "../model/user.schema";
import { Vote, VoteDocument } from "../model/vote.schema";

@Injectable()
export class VoteService {

    /**
     * Crée une instance de VoteService.
     * @param voteModel Le modèle Mongoose injecté pour interagir avec la collection des votes.
     * @param userModel Le modèle Mongoose injecté pour interagir avec la collection des utilisateurs.
     * @param predictionModel Le modèle Mongoose injecté pour interagir avec la collection des prédictions.
     */
    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Prediction.name) private predictionModel: Model<PredictionDocument>,
    ) {}

    /**
     * Normalise un objet vote en s'assurant que les références d'utilisateur et de prédiction sont des chaînes.
     * @param vote L'objet vote à normaliser.
     * @returns L'objet normalisé.
     */
    private normalizeVote(vote: any) {
        const obj = typeof vote.toObject === 'function' ? vote.toObject() : { ...vote };
        if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) obj.user_id = String(obj.user_id._id);
        if (obj.user && typeof obj.user === 'object' && obj.user._id) obj.user_id = String(obj.user._id);

        if (obj.prediction_id && typeof obj.prediction_id === 'object' && obj.prediction_id._id) obj.prediction_id = String(obj.prediction_id._id);
        if (obj.prediction && typeof obj.prediction === 'object' && obj.prediction._id) obj.prediction_id = String(obj.prediction._id);
        return obj;
    }

    /**
     * Récupère tous les votes.
     * @returns Une promesse qui résout un tableau de votes.
     */
    async getAll(): Promise<Vote[]> {
        const votes = await this.voteModel.find().exec();
        return votes.map(vote => this.normalizeVote(vote));
    }

    /**
     * Récupère un vote par son identifiant.
     * @param id Identifiant MongoDB du vote à récupérer.
     * @returns Une promesse qui résout le vote si trouvé, ou `undefined` sinon.
     */
    async getById(id: string): Promise<Vote | undefined> {
        const vote = await this.voteModel.findById(id).exec() ?? undefined;
        if (!vote) return undefined;
        return this.normalizeVote(vote) as Vote;
    }

    /**
     * Crée un nouveau vote. Si le vote est créé avec succès, il retire le montant voté de l'utilisateur et met à jour 
     * le montant total de l'option votée.
     * @param vote Les données du vote à créer.
     * @returns Une promesse qui résout le vote créé, ou rejette une erreur si l'utilisateur ou la prédiction n'existe pas.
     */
    async createVote(vote: Vote): Promise<Vote> {
        // Vérifier que l'utilisateur et la prédiction existent
        const user = await this.userModel.findById(vote.user_id).exec();
        if (!user) throw new Error("Utilisateur non trouvé");

        if(user.points < (vote.amount)) throw new Error("Points insuffisants");

        const prediction = await this.predictionModel.findById(vote.prediction_id).exec();
        if (!prediction) throw new Error("Prédiction non trouvée");

        // Créer et sauvegarder le vote
        const newVote = new this.voteModel(vote);
        const created = await newVote.save();

        // Ajouter le vote à la liste des votes de l'utilisateur
        if (created && (created as any).user_id) {
            try {
                await this.userModel.findByIdAndUpdate((created as any).user_id, { $push: { votes: created._id } }).exec();
                await this.userModel.findByIdAndUpdate((created as any).user_id, { $inc: { points: -(vote.amount) } }).exec();
                
                // Correction de la mise à jour des options de prédiction
                const updateOptions = {};
                updateOptions[`options.${vote.option}`] = vote.amount;
                await this.predictionModel.findByIdAndUpdate((created as any).prediction_id, { $inc: updateOptions }).exec();
            } catch (e) {
                throw new Error(`Erreur update user: ${e.message}`);
            }
        }

        return this.normalizeVote(newVote) as Vote;
    }

    /**
     * Crée ou met à jour un vote. Si un nouveau vote est créé, il retire le montant voté de l'utilisateur et met à jour
     * le montant total de l'option votée.
     * @param id Identifiant MongoDB du vote à créer ou mettre à jour.
     * @param vote Les données du vote à créer ou mettre à jour.
     * @returns Une promesse qui résout le vote créé ou mis à jour
     */
    async createOrUpdateVote(id: string, vote: Vote): Promise<Vote | undefined> {
        const existingVote = await this.voteModel.findById(id).exec();

        // Verifier que l'utilisateur et la prédiction existent
        const user = await this.userModel.findById(vote.user_id).exec();
        if (!user) throw new Error("Utilisateur non trouvé");

        const prediction = await this.predictionModel.findById(vote.prediction_id).exec();
        if (!prediction) throw new Error("Prédiction non trouvée");

        let newVote;

        if (existingVote){  // Mettre à jour le vote existant
            // Verifier que l'utilisateur a assez de points si le montant augmente
            if (vote.amount > existingVote.amount && user.points < (vote.amount - existingVote.amount)) {
                throw new Error("Points insuffisants");
            }

            existingVote.amount = vote.amount ?? existingVote.amount;
            existingVote.option = vote.option ?? existingVote.option;
            existingVote.prediction_id = vote.prediction_id ?? existingVote.prediction_id;
            existingVote.user_id = vote.user_id ?? existingVote.user_id;

            newVote = await existingVote.save();
        }
        else{   // Créer un nouveau vote
            // Verifier que l'utilisateur a assez de points
            if(user.points < (vote.amount)) throw new Error("Points insuffisants");

            const toCreate = vote;
            toCreate._id = id;
            const newPred = new this.voteModel(toCreate);
            newVote = await newPred.save();
        }

        if (newVote && (newVote as any).user_id) {
            try {
                await this.userModel.findByIdAndUpdate((newVote as any).user_id, { $push: { votes: newVote._id } }).exec();
                await this.userModel.findByIdAndUpdate((newVote as any).user_id, { $inc: { points: -(vote.amount) } }).exec();
                
                // Correction de la mise à jour des options de prédiction
                const updateOptions = {};
                updateOptions[`options.${vote.option}`] = vote.amount;
                await this.predictionModel.findByIdAndUpdate((newVote as any).prediction_id, { $inc: updateOptions }).exec();
            } catch (e) {
                throw new Error(`Erreur ${existingVote ? "mise à jour" : "création"} du vote: ${e.message}`);
            }
        }

        return this.normalizeVote(newVote) as Vote;
    }

    /**
     * Supprime un vote.
     * @param id Identifiant MongoDB du vote à supprimer.
     * @returns Une promesse qui résout le vote supprimé, ou `undefined` si le vote n'existe pas.
     */
    async deleteVote(id: string): Promise<Vote | undefined> {
        const deleted = await this.voteModel.findByIdAndDelete(id).exec();
        if (!deleted) return undefined;

        try {
            // Retirer le vote de la liste des votes de l'utilisateur
            await this.userModel.findByIdAndUpdate(deleted.user_id, { $pull: { votes: deleted._id } }).exec();
        } catch (e) {
            throw new Error("Erreur suppression du vote:");
        }

        return this.normalizeVote(deleted) as Vote;
    }

}