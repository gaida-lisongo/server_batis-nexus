import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface pour les méthodes statiques
interface IAnneeStatics {
    getActiveYear(): Promise<IAnnee | null>;
    createNewYear(debut: number): Promise<IAnnee>;
}

// Type combiné pour le modèle
type IAnneeModel = Model<IAnnee> & IAnneeStatics;

export interface IAnnee extends Document {
    debut: number;
    fin: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Méthodes d'instance
    getFullName(): string;
    toggleActive(): Promise<IAnnee>;
}

const AnneeSchema = new Schema<IAnnee>({
    debut: { 
        type: Number, 
        required: true,
        validate: {
            validator: function(v: number) {
                return v >= 2020 && v <= 2050;
            },
            message: 'L\'année de début doit être entre 2020 et 2050'
        }
    },
    fin: { 
        type: Number, 
        required: true,
        validate: {
            validator: function(v: number) {
                return v > (this as any).debut && v <= (this as any).debut + 1;
            },
            message: 'L\'année de fin doit être l\'année suivant le début'
        }
    },
    isActive: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index pour optimiser les recherches
AnneeSchema.index({ debut: 1, fin: 1 }, { unique: true });
AnneeSchema.index({ isActive: 1 });

// Middleware pour s'assurer qu'une seule année est active
AnneeSchema.pre('save', async function(this: IAnnee) {
    if (this.isActive && this.isModified('isActive')) {
        // Désactiver toutes les autres années
        await (this.constructor as IAnneeModel).updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
});

// Méthodes d'instance
AnneeSchema.methods.getFullName = function(this: IAnnee): string {
    return `${this.debut}-${this.fin}`;
};

AnneeSchema.methods.toggleActive = function(this: IAnnee): Promise<IAnnee> {
    this.isActive = !this.isActive;
    return this.save();
};

// Méthodes statiques
AnneeSchema.statics.getActiveYear = function(): Promise<IAnnee | null> {
    return this.findOne({ isActive: true });
};

AnneeSchema.statics.createNewYear = function(debut: number): Promise<IAnnee> {
    return this.create({
        debut,
        fin: debut + 1,
        isActive: false
    });
};

const Annee = (mongoose.models.Annee || mongoose.model<IAnnee, IAnneeModel>('Annee', AnneeSchema)) as IAnneeModel;

export default Annee;