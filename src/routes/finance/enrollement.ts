import express, { Router, Request, Response } from 'express';
import Enrollement from '../../models/Enrollement';
import { randomUUID } from 'node:crypto';
import Etudiant from '../../models/Etudiant';

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { promotionId, anneeId, amount, title, description, matieres, status, planing } = req.body;

        if (!promotionId || !anneeId || !amount || !title || !description || !matieres || !status || !planing) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs sont requis'
            });
        }

        const enrollement = new Enrollement({
            promotionId,
            anneeId,
            amount,
            title,
            description,
            matieres,
            status,
            planing,
        });

        await enrollement.save();

        return res.status(200).json({
            success: true,
            message: 'Enrollement enregistré avec succès',
            data: enrollement
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.patch('/subscriber/:enrollementId', async (req: Request, res: Response) => {
    try {
        const { matricule } = req.body;
        const { enrollementId } = req.params;

        //Generate code with uuid v4
        const code = randomUUID().slice(0, 8);

        const student = await Etudiant.findOne({ matricule });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Etudiant non trouvé'
            });
        }

        const enrollement = await Enrollement.findById(enrollementId);

        if (!enrollement) {
            return res.status(404).json({
                success: false,
                error: 'Enrollement non trouvé'
            });
        }

        //Check if student is already subscribed
        const isSubscribed = enrollement.subscribers.some((subscriber) => subscriber.student.toString() === student._id.toString());

        if (isSubscribed) {
            return res.status(400).json({
                success: false,
                error: 'Student already subscribed'
            });
        }

        enrollement.subscribers.push({
            student: student._id,
            code,
            date_inscription: new Date()
        });

        await enrollement.save();

        return res.status(200).json({
            success: true,
            message: 'Abonné ajouté avec succès',
            data: enrollement
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/promotion/:promotionId', async (req: Request, res: Response) => {
    try {
        const { promotionId } = req.params;

        if (!promotionId) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const enrollements = await Enrollement.find({ promotionId })
            .populate({
                path: 'promotionId',
                populate: {
                    path: 'semestres',
                    populate: {
                        path: 'unites',
                        populate: {
                            path: 'matieres'
                        },
                        model: 'Unite'
                    },
                    model: 'Semestre'
                },
                model: 'Promotion'
            })
            .populate('anneeId')
            .populate('matieres')
            .populate('subscribers.student')
            .populate('planing.matieres');

        return res.status(200).json({
            success: true,
            message: 'Enrollements trouvés avec succès',
            data: enrollements
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/student/:studentId', async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const enrollements = await Enrollement.find({ 'subscribers.student': studentId })
            .populate('promotionId')
            .populate('anneeId')
            .populate('matieres')
            .populate('subscribers.student')
            .populate('planing.matieres');

        return res.status(200).json({
            success: true,
            message: 'Enrollements trouvés avec succès',
            data: enrollements
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.put('/:enrollementId', async (req: Request, res: Response) => {
    try {
        const { enrollementId } = req.params;
        const { promotionId, anneeId, amount, title, description, matieres, status, planing } = req.body;

        if (!promotionId || !anneeId || !amount || !title || !description || !matieres || !status || !planing) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs sont requis'
            });
        }

        const enrollement = await Enrollement.findById(enrollementId);

        if (!enrollement) {
            return res.status(404).json({
                success: false,
                error: 'Enrollement non trouvé'
            });
        }

        enrollement.promotionId = promotionId;
        enrollement.anneeId = anneeId;
        enrollement.amount = amount;
        enrollement.title = title;
        enrollement.description = description;
        enrollement.matieres = matieres;
        enrollement.status = status;
        enrollement.planing = planing;

        await enrollement.save();

        return res.status(200).json({
            success: true,
            message: 'Enrollement modifié avec succès',
            data: enrollement
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.delete('/:enrollementId', async (req: Request, res: Response) => {
    try {
        const { enrollementId } = req.params;

        const enrollement = await Enrollement.findByIdAndDelete(enrollementId);

        if (!enrollement) {
            return res.status(404).json({
                success: false,
                error: 'Enrollement non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Enrollement supprimé avec succès',
            data: enrollement
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

export default router;