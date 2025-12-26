import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Définir l'Interface pour les propriétés du Document
export interface IGrade extends Document {
  code: string;
  description: string;
  type: string;
  createdAt: Date;
}

// 2. Type transitoire pour l'API (sans les propriétés MongoDB)
export interface GradeData {
  _id?: string;
  code: string;
  description: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 3. Type pour la création (sans _id)
export interface CreateGradeData {
  code: string;
  description: string;
  type: string;
}

// 2. Définir l'Interface pour le Modèle Mongoose
// Ceci ajoute les méthodes statiques/d'instance si vous en définissez
export interface GradeModel extends Model<IGrade> {}

/* Définition du Schéma */
const GradeSchema: Schema = new Schema({
  code: {
    type: String,
    required: [true, 'Veuillez ajouter un code.'],
    maxlength: [60, 'Le code ne peut pas dépasser 60 caractères.'],
    unique: true,
  },
  type: {
    type: String,
    required: [true, 'Veuillez ajouter un type.'],
    maxlength: [60, 'Le type ne peut pas dépasser 60 caractères.'],
  },
  description: {
    type: String,
    required: [true, 'Veuillez ajouter une description.'],
    maxlength: [60, 'La description ne peut pas dépasser 60 caractères.'],
  },
}, {
    timestamps: true // Ajoute `createdAt` et `updatedAt` automatiquement
});


// 3. Exporter le Modèle Typé
const Grade = (mongoose.models.Grade || mongoose.model<IGrade, GradeModel>('Grade', GradeSchema)) as GradeModel;

export default Grade;