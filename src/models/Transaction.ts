import mongoose, { Schema, Document, Model } from 'mongoose';

export const PRODUCT_TYPES = [
    'Inscription',
    'Ressource', 
    'Activity', 
    'Recours',
    'Bulletin',
    'Document',
    'Enrollement',
    'Modalite'
] as const;

export interface ISubcription extends Document {
    student: mongoose.Types.ObjectId;
    lastSolde: number;
    newSolde: number;
}

export interface ITransaction extends Document {
    amount: number
    agentId?: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    productType: string;
    status: string;
    subscriptions?: ISubcription[];
}

const TransactionSchema = new Schema<ITransaction>({
    amount: { type: Number, required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productType: { type: String, enum: PRODUCT_TYPES, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    subscriptions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
        lastSolde: { type: Number, required: true },
        newSolde: { type: Number, required: true },
    }]
}, { timestamps: true });   

// Modèle
const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;