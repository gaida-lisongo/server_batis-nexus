import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// 1. Définir les Interfaces pour les propriétés des Documents
export interface ISection extends Document {
  designation: string;
  bureau: [{
    agent: Types.ObjectId;
    role: string;
  }];
  filieres?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotion extends Document {
  designation: string;
  systeme: string;
  niveau: string;
  cycle: string;
  semestres?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFiliere extends Document {
  designation: string;
  description?: string;
  bureau: [{
    agent: Types.ObjectId;
    role: string;
  }];
  promotions?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMention extends Document {
  designation: string;
  description?: string;
  filieres?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Définir les Schémas
const SectionSchema = new Schema<ISection>({
  designation: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bureau: [{
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    role: {
      type: String,
      required: true
    }
  }],
  filieres: [{
    type: Schema.Types.ObjectId,
    ref: 'Filiere'
  }]
}, {
  timestamps: true
});

const PromotionSchema = new Schema<IPromotion>({
  designation: {
    type: String,
    required: true,
    trim: true
  },
  systeme: {
    type: String,
    required: true,
    enum: ['LMD', 'Classique']
  },
  niveau: {
    type: String,
    required: true,
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3']
  },
  cycle: {
    type: String,
    required: true,
    enum: ['Licence', 'Master', 'Doctorat']
  },
  semestres: [{
    type: Schema.Types.ObjectId,
    ref: 'Semestre'
  }]
}, {
  timestamps: true
});

const FiliereSchema = new Schema<IFiliere>({
  designation: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  bureau: [{
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['Président', 'Secrétaire', 'Membre']
    }
  }],
  promotions: [{
    type: Schema.Types.ObjectId,
    ref: 'Promotion'
  }]
}, {
  timestamps: true
});

const MentionSchema = new Schema<IMention>({
  designation: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filieres: [{
    type: Schema.Types.ObjectId,
    ref: 'Filiere'
  }]
}, {
  timestamps: true
});

// 3. Créer les Modèles
export const Section: Model<ISection> = mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);
export const Promotion: Model<IPromotion> = mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
export const Filiere: Model<IFiliere> = mongoose.models.Filiere || mongoose.model<IFiliere>('Filiere', FiliereSchema);
export const Mention: Model<IMention> = mongoose.models.Mention || mongoose.model<IMention>('Mention', MentionSchema);

export default {
  Section,
  Promotion,
  Filiere,
  Mention
};
