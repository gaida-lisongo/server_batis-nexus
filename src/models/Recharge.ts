import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IRecharge extends Document {
    orderNumber: string;
    currency: string;
    phone: string;
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    etudiantId?: mongoose.Types.ObjectId;
    transactionId?: string;
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Fonction pour générer un numéro de commande unique
function generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `RCH${timestamp.slice(-6)}${random}`;
}

// Schema pour les recharges
const RechargeSchema = new Schema<IRecharge>({
    orderNumber: { 
        type: String, 
        required: true, 
        unique: true,
        default: generateOrderNumber
    },
    currency: { 
        type: String, 
        required: true, 
        default: 'USD',
        enum: ['USD', 'CDF', 'EUR']
    },
    phone: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v: string) {
                // Accepter le format 243XXXXXXXXX (243 suivi de 9 chiffres)
                return /^243[0-9]{9}$/.test(v);
            },
            message: 'Numéro de téléphone invalide - Format attendu: 243XXXXXXXXX'
        }
    },
    amount: { 
        type: Number, 
        required: true,
        min: [1, 'Le montant doit être supérieur à 0']
    },
    description: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    etudiantId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Etudiant'
    },
    transactionId: { 
        type: String,
        sparse: true
    },
    paymentMethod: {
        type: String,
        enum: ['mobile_money', 'bank_transfer', 'cash', 'card'],
        default: 'mobile_money'
    }
}, {
    timestamps: true
});

// Index pour optimiser les recherches
RechargeSchema.index({ orderNumber: 1 });
RechargeSchema.index({ etudiantId: 1 });
RechargeSchema.index({ status: 1 });
RechargeSchema.index({ createdAt: -1 });
RechargeSchema.index({ phone: 1 });

// Middleware pour générer orderNumber si non fourni
RechargeSchema.pre('save', function() {
    if (!this.status) {
        this.status = 'pending';
    }
});

// Méthodes d'instance
RechargeSchema.methods.markAsCompleted = function(transactionId?: string) {
    this.status = 'completed';
    if (transactionId) {
        this.transactionId = transactionId;
    }
    return this.save();
};

RechargeSchema.methods.markAsFailed = function() {
    this.status = 'failed';
    return this.save();
};

RechargeSchema.methods.cancel = function() {
    if (this.status === 'pending') {
        this.status = 'cancelled';
        return this.save();
    }
    throw new Error('Seules les recharges en attente peuvent être annulées');
};

// Méthodes statiques
RechargeSchema.statics.findByOrderNumber = function(orderNumber: string) {
    return this.findOne({ orderNumber });
};

RechargeSchema.statics.findByEtudiant = function(etudiantId: string) {
    return this.find({ etudiantId }).sort({ createdAt: -1 });
};

RechargeSchema.statics.findByStatus = function(status: string) {
    return this.find({ status }).sort({ createdAt: -1 });
};

RechargeSchema.statics.findByPhone = function(phone: string) {
    return this.find({ phone }).sort({ createdAt: -1 });
};

RechargeSchema.statics.getStatistics = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
};

// Modèle
const Recharge: Model<IRecharge> = mongoose.models.Recharge || mongoose.model<IRecharge>('Recharge', RechargeSchema);

export default Recharge;
