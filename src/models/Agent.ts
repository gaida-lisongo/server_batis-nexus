import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// 1. Définir l'Interface pour les propriétés du Document
export interface IAgent extends Document {
  photo?: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: Types.ObjectId;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string;
  adresse?: string;
  solde: number;
}

export interface AgentData {
  photo?: string;
  _id?: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string;
  adresse?: string;
  solde: number;
}

export interface CreateAgentData {
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string
}

export interface AgentModel extends Model<IAgent> {
  // Add any static methods here if needed
}

/* Définition du Schéma */
const AgentSchema: Schema = new Schema({
  photo: {
    type: String,
    required: false,
  },
  nom: {
    type: String,
    required: [true, 'Veuillez ajouter un nom.'],
    maxlength: [60, 'Le nom ne peut pas dépasser 60 caractères.'],
  },
  post_nom: {
    type: String,
    required: [true, 'Veuillez ajouter un post nom.'],
    maxlength: [60, 'Le post nom ne peut pas dépasser 60 caractères.'],
  },
  prenom: {
    type: String,
    required: false,
    maxlength: [60, 'Le prenom ne peut pas dépasser 60 caractères.'],
  },
  grade: {
    type: Schema.Types.ObjectId,
    ref: 'Grade',
    required: [true, 'Veuillez ajouter un grade.'],
  },
  matricule: {
    type: String,
    required: [true, 'Veuillez ajouter un matricule.'],
    maxlength: [60, 'Le matricule ne peut pas dépasser 60 caractères.'],
  },
  secure: {
    type: String,
    required: [true, 'Veuillez ajouter un secure.'],
    maxlength: [128, 'Le secure ne peut pas dépasser 128 caractères.'],
  },
  sexe: {
    type: String,
    required: [true, 'Veuillez ajouter un sexe.'],
    maxlength: [60, 'Le sexe ne peut pas dépasser 60 caractères.'],
  },
  email: {
    type: String,
    required: false,
    maxlength: [60, 'Le email ne peut pas dépasser 60 caractères.'],
  },
  telephone: {
    type: String,
    required: false,
    maxlength: [60, 'Le telephone ne peut pas dépasser 60 caractères.'],
  },
  solde: {
    type: Number,
    required: [true, 'Veuillez ajouter un solde.'],
    default: 0,
  },
  adresse: {
    type: String,
    required: false,
  }
}, {
  timestamps: true // Ajoute `createdAt` et `updatedAt` automatiquement
});

// 3. Exporter le Modèle Typé
const Agent = (mongoose.models.Agent || mongoose.model<IAgent, AgentModel>('Agent', AgentSchema)) as AgentModel;

export default Agent;