import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParcours extends Document {
    etudiantId: mongoose.Types.ObjectId;
    promotionId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    transaction?: mongoose.Types.ObjectId;
    statut: string
    notes?: {
        matiereId: mongoose.Types.ObjectId;
        cmi: number;
        examen: number;
        rattrapage: number
    }[]
}

const ParcoursSchema = new Schema<IParcours>({
    etudiantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    anneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Annee', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    statut: { type: String, enum: ['En cours', 'Terminé', 'Annulé'], default: 'En cours' },
    notes: [{
        matiereId: { type: Schema.Types.ObjectId, ref: 'Matiere', required: true },
        cmi: { type: Number, min: 0, max: 20, default: 0 },
        examen: { type: Number, min: 0, max: 20, default: 0 },
        rattrapage: { type: Number, min: 0, max: 20, default: 0 }
    }]
});

ParcoursSchema.index({ etudiantId: 1, promotionId: 1, anneeId: 1 }, { unique: true });


// Modèle
const Parcours: Model<IParcours> = mongoose.models.Parcours || mongoose.model<IParcours>('Parcours', ParcoursSchema);

export default Parcours;
