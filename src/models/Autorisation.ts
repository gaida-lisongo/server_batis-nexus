import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// 1. Définir l'Interface pour les propriétés du Document
export interface IAutorisation extends Document {
  designation: string;
  agents?: Types.ObjectId[];
  createdAt: Date;
}

export interface AutorisationData {
  _id?: string;
  designation: string;
  agents?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAutorisationData {
  designation: string;
  agents?: string[];
}

export interface AutorisationModel extends Model<IAutorisation> {
  // Add any static methods here if needed
}

/* Définition du Schéma */
const AutorisationSchema: Schema = new Schema({
  designation: {
    type: String,
    required: [true, 'Veuillez ajouter une designation.'],
    maxlength: [60, 'La designation ne peut pas dépasser 60 caractères.'],
  },
  agents: {
    type: [Types.ObjectId],
    ref: 'Agent',
  },
}, {
    timestamps: true // Ajoute `createdAt` et `updatedAt` automatiquement
});

// 3. Exporter le Modèle Typé
const Autorisation = (mongoose.models.Autorisation || mongoose.model<IAutorisation, AutorisationModel>('Autorisation', AutorisationSchema)) as AutorisationModel;

export default Autorisation;