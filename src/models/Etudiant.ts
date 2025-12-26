import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import crypto from 'crypto';

export interface IEtudiant extends Document {
    nom: string;
    post_nom: string;
    prenom?: string;
    matricule: string;
    secure: string;
    sexe: 'M' | 'F';
    photo?: string;
    solde?: number;
    nationalite?: string;
    lieu_naissance?: string;
    date_naissance?: string;
    // Méthodes d'instance
    getFullName(): string;
}

// Fonction pour générer un matricule unique
function generateMatricule(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ETU${year}${random}`;
}

// Fonction pour générer un code sécurisé
function generateSecureCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Schema pour les étudiants
const EtudiantSchema = new Schema<IEtudiant>({
    nom: { type: String, required: true, trim: true },
    post_nom: { type: String, required: true, trim: true },
    prenom: { type: String, trim: true },
    matricule: { 
        type: String, 
        required: true, 
        unique: true,
        default: generateMatricule
    },
    secure: { 
        type: String, 
        required: true,
        default: generateSecureCode
    },
    sexe: { 
        type: String, 
        required: true, 
        enum: ['M', 'F'] 
    },
    photo: { type: String },
    solde: { type: Number, default: 0 },
    nationalite: { type: String },
    lieu_naissance: { type: String },
    date_naissance: { type: Date },
}, {
    timestamps: true
});

// Index pour optimiser les recherches
EtudiantSchema.index({ matricule: 1 });
EtudiantSchema.index({ nom: 1, post_nom: 1 });

// Middleware pour générer matricule et secure si non fournis
EtudiantSchema.pre('save', function() {
    if (!this.matricule) {
        this.matricule = generateMatricule();
    }
    if (!this.secure) {
        this.secure = generateSecureCode();
    }
});

// Méthodes d'instance
EtudiantSchema.methods.getFullName = function(): string {
    return `${this.nom} ${this.post_nom} ${this.prenom || ''}`.trim();
};


// Méthodes statiques
EtudiantSchema.statics.findByMatricule = function(matricule: string) {
    return this.findOne({ matricule });
};

EtudiantSchema.statics.searchByName = function(searchTerm: string) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find({
        $or: [
            { nom: regex },
            { post_nom: regex },
            { prenom: regex },
            { matricule: regex }
        ]
    });
};

export const Etudiant: Model<IEtudiant> = mongoose.models.Etudiant || mongoose.model<IEtudiant>('Etudiant', EtudiantSchema);

export default Etudiant;
