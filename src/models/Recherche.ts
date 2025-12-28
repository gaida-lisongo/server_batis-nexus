import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRecherche extends Document {
    promotionId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    amount: number;
    title: string;
    description: string;
    categorie: 'Sujet' | 'Stage';
    status: string;
    subscribers: {
        title: string;
        description: string;
        student: mongoose.Types.ObjectId;
        tuteur?: mongoose.Types.ObjectId;
        date_inscription: Date;
        planing?: {
            date_tache: Date;
            tache: string;
            observation?: string;
            statut: string;
        }[];
        report?: string;
        note?: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const RechercheSchema: Schema = new Schema({
    promotionId: {
        type: mongoose.Types.ObjectId,
        ref: 'Promotion',
        required: true
    },
    anneeId: {
        type: mongoose.Types.ObjectId,
        ref: 'Annee',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categorie: {
        type: String,
        enum: ['Sujet', 'Stage'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
        required: true
    },
    subscribers: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        student: {
            type: mongoose.Types.ObjectId,
            ref: 'Etudiant',
            required: true
        },
        tuteur: {
            type: mongoose.Types.ObjectId,
            ref: 'Agent',
            required: true
        },
        date_inscription: {
            type: Date,
            default: Date.now
        },
        planing: [{
            date_tache: {
                type: Date,
            },
            tache: {
                type: String,
            },
            observation: {
                type: String,
            },
            statut: {
                type: String,
                enum: ['Pending', 'Completed', 'Failed'],
                default: 'Pending'
            }
        }],
        report: {
            type: String,
        },
        note: {
            type: Number,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Recherche: Model<IRecherche> = mongoose.model<IRecherche>('Recherche', RechercheSchema);

export default Recherche;
