import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface pour un document Activity
export interface IActivity extends Document {
    title: String;
    transaction?: mongoose.Types.ObjectId;
    description: String;
    type: String;
    status: String;
    maximumScore: Number;
    resolutions: {
        student: mongoose.Types.ObjectId;
        score: Number;
        dateSubmitted: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IResource extends Document {
    title: String;
    transaction?: mongoose.Types.ObjectId;
    url: String;
    montant: Number;
    description?: String;
    commandes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IRecours extends Document {
    student: mongoose.Types.ObjectId;
    transaction?: mongoose.Types.ObjectId;
    object: String;
    description?: String;
    status: String;
    preuves: String[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ISeance extends Document {
    date: Date;
    transaction?: mongoose.Types.ObjectId;
    startTime: String;
    endTime: String;
    topic: String;
    description?: String;
    location?: String;
    presences: {
        student: mongoose.Types.ObjectId, 
        location: String,
        status: String,
        timeRecorded: Date
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Interface pour un document Charge
export interface ICharge extends Document {
    cours: mongoose.Types.ObjectId;
    transaction?: mongoose.Types.ObjectId;
    enseignant: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    promotionId: mongoose.Types.ObjectId;
    status: String;
    activities: mongoose.Types.ObjectId[];
    ressources: mongoose.Types.ObjectId[];
    recours: mongoose.Types.ObjectId[];
    seances: mongoose.Types.ObjectId[];
    objectif: String;
    contenu: String;
    methodologie: String;
    evaluation: String;
    references: String;
    plannings: {
        date_debut: Date;
        date_fin: Date;
        heure_debut: String;
        heure_fin: String;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Schéma Mongoose pour les activités
const ActivitySchema: Schema = new Schema({
    title: { type: String, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    description: { type: String },
    type: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    maximumScore: { type: Number, required: true },
    resolutions: [{
        student: { type: Schema.Types.ObjectId, ref: 'Etudiant', required: true },
        score: { type: Number, required: true },
        dateSubmitted: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Schéma Mongoose pour les ressources
const ResourceSchema: Schema = new Schema({
    title: { type: String, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    url: { type: String, required: true },
    montant: { type: Number, required: true },
    description: { type: String },
    commandes: [{ type: Schema.Types.ObjectId, ref: 'Etudiant' }]
}, {
    timestamps: true
});

// Schéma Mongoose pour les recours
const RecoursSchema: Schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    object: { type: String, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    description: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    preuves: [{ type: String }]
}, {
    timestamps: true
});

// Schéma Mongoose pour les séances
const SeanceSchema: Schema = new Schema({
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    endTime: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    presences: [{
        student: { type: Schema.Types.ObjectId, ref: 'Etudiant', required: true },
        location: { type: String },
        status: { type: String, enum: ['present', 'absent', 'late'], required: true },
        timeRecorded: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Schéma Mongoose pour le modèle Charge
const ChargeSchema: Schema = new Schema({
    cours: { type: Schema.Types.ObjectId, ref: 'Matiere', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    anneeId: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
    promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
    enseignant: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
    ressources: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    recours: [{ type: Schema.Types.ObjectId, ref: 'Recours' }],
    seances: [{ type: Schema.Types.ObjectId, ref: 'Seance' }],
    objectif: { type: String },
    contenu: { type: String },
    methodologie: { type: String },
    evaluation: { type: String },
    references: { type: String },
    plannings: [{
        date_debut: { type: Date },
        date_fin: { type: Date },
        heure_debut: { type: String },
        heure_fin: { type: String },
    }],
}, {
    timestamps: true
});

// Créer et exporter le modèle Charge
export const Charge: Model<ICharge> = mongoose.models.Charge || mongoose.model<ICharge>('Charge', ChargeSchema);
export const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
export const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
export const Recours: Model<IRecours> = mongoose.models.Recours || mongoose.model<IRecours>('Recours', RecoursSchema);
export const Seance: Model<ISeance> = mongoose.models.Seance || mongoose.model<ISeance>('Seance', SeanceSchema);