import { randomUUID } from "crypto";
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEnrollement extends Document {
    promotionId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    amount: number;
    title: string;
    description: string;
    matieres: mongoose.Types.ObjectId[];
    status: string;
    planing: {
        date_examen: Date;
        matieres: mongoose.Types.ObjectId[];
    }[];
    subscribers: {
        student: mongoose.Types.ObjectId;
        code: string;
        date_inscription: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const EnrollementSchema: Schema = new Schema({
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
    matieres: {
        type: [mongoose.Types.ObjectId],
        ref: 'Matiere',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
        required: true
    },
    planing: [{
        date_examen: {
            type: Date,
            required: true
        },
        matieres: {
            type: [mongoose.Types.ObjectId],
            ref: 'Matiere',
            required: true
        }
    }],
    subscribers: [{
        student: {
            type: mongoose.Types.ObjectId,
            ref: 'Etudiant',
            required: true
        },
        code: {
            type: String,
            required: true
        },
        date_inscription: {
            type: Date,
            default: Date.now
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

const Enrollement: Model<IEnrollement> = mongoose.model<IEnrollement>('Enrollement', EnrollementSchema);

export default Enrollement;
