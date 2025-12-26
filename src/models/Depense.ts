import mongoose, { Document, Schema, Model } from "mongoose";
import './Agent';
import './Annee';

export interface IDepense extends Document {
    agentId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    service: string;
    amount: number;
    status: string;
    orderNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

const DepenseSchema: Schema = new Schema({
    agentId: {
        type: mongoose.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    anneeId: {
        type: mongoose.Types.ObjectId,
        ref: 'Annee',
        required: true
    },
    service: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Depense: Model<IDepense> = mongoose.model<IDepense>('Depense', DepenseSchema);

export default Depense;

