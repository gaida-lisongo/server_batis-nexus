import express, { Router, Request, Response } from 'express';
import Transaction from '../../models/Transaction';
import Parcours from '../../models/Parcours';
import { Activity, Recours, Resource } from '../../models/Charge';
import Commandes from '../../models/Commande';
import mongoose, { Types } from 'mongoose';
import Etudiant from '../../models/Etudiant';
import Agent from '../../models/Agent';

const router: Router = express.Router();
//Créate a new transaction
router.post('/', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { amount, agentId, productId, productType } = body;

        if (!amount || !productId || !productType) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const newTransaction = new Transaction({
            amount,
            agentId,
            productId,
            productType,
            status: 'Pending'
        });

        await newTransaction.save();

        let model;

        switch (productType) {
            case 'Inscription':
                model = await Parcours.findById(productId);
                break;
            case 'Ressource':
                model = await Resource.findById(productId);
                break;
            case 'Activity':
                model = await Activity.findById(productId);
                break;
            case 'Recours':
                model = await Recours.findById(productId);
                break;
            case 'Bulletin':
                model = await Commandes.findById(productId);
                break;
            case 'Document':
                // model = await import('@/models/Document');
                break;
            case 'Enrollement':
                // model = await import('@/models/Enrollement');
                break;
            case 'Modalite':
                // model = await import('@/models/Modalite');
                break;
        }

        if (model) {
            //ad property transaction to the model
            model.transaction = newTransaction._id;
            await model.save();
        }

        return res.status(201).json({ success: true, data: newTransaction });
    } catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

//Read all or one transaction now with query params
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            id,
            status,
            productType,
            productId,
            agentId,
            page: pageStr,
            limit: limitStr,
            sortBy,
            sortOrder
        } = req.query as any;

        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '10000');
        const finalSortBy = sortBy || 'createdAt';
        const finalSortOrder = sortOrder || 'desc';

        // Si un ID est fourni, retourner cette transaction spécifique
        if (id) {
            const transaction = await Transaction.findById(id)
                .populate('agentId', 'nom prenom email')
                .populate({
                    path: 'subscriptions.student',
                    select: 'nom prenom numero'
                });

            if (!transaction) {
                return res.status(404).json(
                    { success: false, error: 'Transaction not found' }
                );
            }

            return res.status(200).json({
                success: true,
                data: transaction
            });
        }

        // Construction du filtre
        const filter: any = {};
        if (status) filter.status = status;
        if (productType) filter.productType = productType;
        if (productId) filter.productId = productId;
        if (agentId) filter.agentId = agentId;

        // Calcul de la pagination
        const skip = (page - 1) * limit;

        // Construction du tri
        const sort: any = {};
        sort[finalSortBy] = finalSortOrder === 'asc' ? 1 : -1;

        // Exécution de la requête avec pagination
        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .populate('agentId', 'nom prenom email')
                .populate({
                    path: 'subscriptions.student',
                    select: 'nom prenom numero'
                })
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        );
    }
});

//Update a transaction
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json(
                { success: false, error: 'Transaction ID is required' }
            );
        }

        const body = req.body;
        const { amount, agentId, productId, productType, status, subscriptions } = body;

        // Vérifier si la transaction existe
        const existingTransaction = await Transaction.findById(id);
        if (!existingTransaction) {
            return res.status(404).json(
                { success: false, error: 'Transaction not found' }
            );
        }

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (amount !== undefined) updateData.amount = amount;
        if (agentId !== undefined) updateData.agentId = agentId;
        if (productId !== undefined) updateData.productId = productId;
        if (productType !== undefined) updateData.productType = productType;
        if (status !== undefined) updateData.status = status;
        if (subscriptions !== undefined) updateData.subscriptions = subscriptions;

        // Mettre à jour la transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('agentId', 'nom prenom email')
            .populate({
                path: 'subscriptions.student',
                select: 'nom prenom numero'
            });

        // Si le productId ou productType a changé, mettre à jour l'ancienne et la nouvelle référence
        if (productId || productType) {
            // Supprimer la référence de l'ancien produit
            if (existingTransaction.productType && existingTransaction.productId) {
                await updateProductReference(existingTransaction.productType, existingTransaction.productId, null);
            }

            // Ajouter la référence au nouveau produit
            if (updatedTransaction!.productType && updatedTransaction!.productId) {
                await updateProductReference(updatedTransaction!.productType, updatedTransaction!.productId, updatedTransaction!._id);
            }
        }

        return res.status(200).json({
            success: true,
            data: updatedTransaction,
            message: 'Transaction updated successfully'
        });

    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        );
    }
});

//Create new subscription for a transaction PATCH
router.patch('/', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { transactionId, studentId } = body;

        // Validation des champs requis
        if (!transactionId || !studentId) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: transactionId and studentId are required"
            });
        }

        // Validation du format des IDs
        if (!mongoose.Types.ObjectId.isValid(transactionId) || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID format"
            });
        }

        // Vérifier si l'étudiant existe
        const studentData = await Etudiant.findById(studentId);
        if (!studentData) {
            return res.status(404).json({
                success: false,
                error: "Student not found"
            });
        }

        // Vérifier si la transaction existe
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: "Transaction not found"
            });
        }

        // Vérifier si l'étudiant n'est pas déjà inscrit à cette transaction
        const existingSubscription = transaction.subscriptions?.find(
            (sub: any) => sub.student.toString() === studentId
        );

        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                error: "Student is already subscribed to this transaction"
            });
        }

        const lastSolde = studentData.solde || 0;
        const transactionAmount = transaction.amount || 0;

        // Vérifier si l'étudiant a suffisamment de solde
        if (lastSolde < transactionAmount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. Current: ${lastSolde}, Required: ${transactionAmount}`
            });
        }

        const newSolde = lastSolde - transactionAmount;

        // Utiliser une transaction MongoDB pour assurer la cohérence
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update student solde
            await Etudiant.findByIdAndUpdate(
                studentId,
                { solde: newSolde },
                { session }
            );

            // Create subscription object
            const newSubscription = {
                student: new mongoose.Types.ObjectId(studentId),
                lastSolde: lastSolde,
                newSolde: newSolde,
                subscribedAt: new Date()
            };

            // Add subscription to transaction
            await Transaction.findByIdAndUpdate(
                transactionId,
                {
                    $push: { subscriptions: newSubscription },
                    $set: { updatedAt: new Date() }
                },
                { session }
            );

            //Credit solde of agent of trasaction.agentId
            await Agent.findByIdAndUpdate(
                transaction.agentId,
                { $inc: { solde: transactionAmount } },
                { session }
            );

            // Commit the transaction
            await session.commitTransaction();

            // Récupérer la transaction mise à jour avec les détails populés
            const updatedTransaction = await Transaction.findById(transactionId)
                .populate('agentId', 'nom prenom email')
                .populate({
                    path: 'subscriptions.student',
                    select: 'nom prenom numero matricule'
                });

            return res.status(200).json({
                success: true,
                data: {
                    subscription: newSubscription,
                    transaction: updatedTransaction,
                    message: "Student successfully subscribed to transaction"
                }
            });

        } catch (sessionError) {
            // Rollback the transaction
            await session.abortTransaction();
            throw sessionError;
        } finally {
            // End the session
            session.endSession();
        }

    } catch (error) {
        console.error('PATCH transaction error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
});

//Delete a transaction
router.delete('/', async (req: Request, res: Response) => {
    try {

        const { id } = req.body;

        if (!id) {
            return res.status(400).json(
                { success: false, error: 'Transaction ID is required' }
            );
        }

        // Vérifier si la transaction existe
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json(
                { success: false, error: 'Transaction not found' }
            );
        }

        // Empêcher la suppression des transactions complétées (optionnel)
        if (transaction.status === 'Completed') {
            return res.status(400).json(
                {
                    success: false,
                    error: 'Cannot delete a completed transaction. Consider changing status to Failed instead.'
                }
            );
        }

        // Supprimer la référence de la transaction dans le produit associé
        if (transaction.productType && transaction.productId) {
            await updateProductReference(transaction.productType, transaction.productId, null);
        }

        // Supprimer la transaction
        await Transaction.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            deletedId: id
        });

    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        );
    }
});

// Fonction utilitaire pour mettre à jour les références de transaction dans les produits
async function updateProductReference(productType: string, productId: Types.ObjectId, transactionId: Types.ObjectId | null) {
    try {
        let model: any;

        switch (productType) {
            case 'Inscription':
                model = Parcours;
                break;
            case 'Ressource':
                model = Resource;
                break;
            case 'Activity':
                model = Activity;
                break;
            case 'Recours':
                model = Recours;
                break;
            case 'Bulletin':
                model = Commandes;
                break;
            // Ajoutez d'autres cas selon vos besoins
            default:
                return;
        }

        if (model) {
            const updateData = transactionId ? { transaction: transactionId } : { $unset: { transaction: 1 } };
            await model.findByIdAndUpdate(productId, updateData);
        }
    } catch (error) {
        console.error('Error updating product reference:', error);
        // Ne pas faire échouer la transaction principale pour cette erreur
    }
}

export default router;
