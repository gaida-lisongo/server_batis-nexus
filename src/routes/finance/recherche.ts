import express, { Router, Request, Response } from "express";
import Recherche from "../../models/Recherche";
import Etudiant from "../../models/Etudiant";

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            promotionId,
            anneeId,
            amount,
            title,
            description,
            categorie
        } = req.body;

        if (!promotionId || !anneeId || !amount || !title || !description || !categorie) {
            return res.status(400).json({
                success: false,
                error: 'Veuillez remplir les champs obligatoir'
            });
        }

        const recherche = new Recherche({
            status: 'Pending',
            promotionId,
            anneeId,
            amount,
            title,
            description,
            categorie,
            subscribers: []
        });

        await recherche.save();

        return res.status(200).json({
            success: true,
            message: 'Recherche enregistré avec succès'
        })
    } catch (error: any) {
        console.error("Erro when creating new recherche : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
});

router.patch('/subscribe/:rechercheId', async (req: Request, res: Response) => {
    try {
        const { matricule, tuteur, title, description } = req.body;
        const { rechercheId } = req.params;

        const recherche = await Recherche.findById(rechercheId);

        if (!matricule || !tuteur || !title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Veuillez remplir les champs obligatoir'
            });
        }

        if (!recherche) {
            return res.status(404).json({
                success: false,
                error: 'Recherche non trouvé'
            });
        }

        const student = await Etudiant.findOne({ matricule });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Etudiant non trouvé'
            });
        }

        const isSubscribed = recherche.subscribers.some((subscriber) => subscriber.student.toString() === student._id.toString());

        if (isSubscribed) {
            return res.status(400).json({
                success: false,
                error: 'Etudiant deja abonné'
            });
        }

        recherche.subscribers.push({
            title,
            description,
            student: student._id,
            tuteur,
            planing: [],
            report: '',
            note: 0,
            date_inscription: new Date()
        });

        await recherche.save();

        return res.status(200).json({
            success: true,
            message: 'Abonné ajouté avec succès',
            data: recherche
        });

    } catch (error: any) {
        console.error("Erro when creating new recherche : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }

});

router.patch('/note/:rechercheId', async (req: Request, res: Response) => {
    try {
        const { rechercheId } = req.params;
        const { studentId, note } = req.body;

        const recherche = await Recherche.findById(rechercheId);

        if (!recherche) {
            return res.status(404).json({
                success: false,
                error: 'Recherche non trouvé'
            });
        }

        const student = recherche.subscribers.find((subscriber) => subscriber.student.toString() === studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Etudiant non trouvé'
            });
        }

        student.note = note;

        await recherche.save();

        return res.status(200).json({
            success: true,
            message: 'Note modifié avec succès',
            data: recherche
        });
    } catch (error: any) {
        console.error("Erro when updating note : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
})

router.put('/id/:rechercheId', async (req: Request, res: Response) => {
    try {
        const { rechercheId } = req.params;
        const { title, description, status } = req.body;

        const recherche = await Recherche.findById(rechercheId);

        if (!recherche) {
            return res.status(404).json({
                success: false,
                error: 'Recherche non trouvé'
            });
        }

        recherche.title = title;
        recherche.description = description;
        recherche.status = status;

        await recherche.save();

        return res.status(200).json({
            success: true,
            message: 'Recherche modifié avec succès',
            data: recherche
        });
    } catch (error: any) {
        console.error("Erro when updating recherche : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
});

router.get('/promotion/:promotionId', async (req: Request, res: Response) => {
    try {
        const { promotionId } = req.params;
        const { anneeId } = req.query;
        const { categorie } = req.query;
        const { student } = req.query;
        const { tuteur } = req.query;

        let query: any = {}

        if (anneeId) {
            query.anneeId = anneeId
        }

        if (promotionId) {
            query.promotionId = promotionId
        }

        if (categorie) {
            query.categorie = categorie
        }

        if (student) {
            query.subscribers.student = student
        }

        if (tuteur) {
            query.subscribers.tuteur = tuteur
        }

        const recherche = await Recherche.find(query)
            .populate([
                {
                    path: 'promotionId',
                    model: 'Promotion'
                },
                {
                    path: 'anneeId',
                    model: 'Annee'
                },
                {
                    path: 'subscribers.student',
                    model: 'Etudiant'
                },
                {
                    path: 'subscribers.tuteur',
                    model: 'Agent'
                }
            ])

        return res.status(200).json({
            success: true,
            message: 'Recherche trouvé avec succès',
            data: recherche
        });
    } catch (error: any) {
        console.error("Erro when getting recherche : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
});

router.delete('/subscription', async (req: Request, res: Response) => {
    try {
        const { etudiantId, rechercheId } = req.body;
        const recherche = await Recherche.findById(rechercheId);

        if (!recherche) {
            return res.status(404).json({
                success: false,
                error: 'Recherche non trouvé'
            });
        }

        const etudiant = recherche.subscribers.find((subscriber) => subscriber.student.toString() === etudiantId);

        if (!etudiant) {
            return res.status(404).json({
                success: false,
                error: 'Etudiant non trouvé'
            });
        }

        recherche.subscribers = recherche.subscribers.filter((subscriber) => subscriber.student.toString() !== etudiantId);

        await recherche.save();

        return res.status(200).json({
            success: true,
            message: 'Abonné supprimé avec succès',
        });
    } catch (error: any) {
        console.error("Erro when deleting etudiant : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
})

router.delete('/:rechercheId', async (req: Request, res: Response) => {
    try {
        const { rechercheId } = req.params;

        const recherche = await Recherche.findByIdAndDelete(rechercheId);

        if (!recherche) {
            return res.status(404).json({
                success: false,
                error: 'Recherche non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Recherche supprimé avec succès',
        });
    } catch (error: any) {
        console.error("Erro when deleting recherche : ", error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        })
    }
});



export default router;