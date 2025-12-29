import express, { Router, Request, Response } from "express";
import { Semestre } from "../models/Semestre";

const router: Router = express.Router();

router.put('/:semestreId/disassociate-unite', async (req: Request, res: Response) => {
    try {
        const { semestreId } = req.params;
        const { uniteId } = req.body;

        const semestre = await Semestre.findById(semestreId);

        if (!semestre) {
            return res.status(404).json({
                success: false,
                message: 'Semestre non trouvé'
            });
        }

        const isExisted = semestre?.unites.find((unite) => unite.toString() === uniteId.toString());

        if (!isExisted) {
            return res.status(400).json({
                success: false,
                message: 'Unite non trouvée dans le semestre'
            });
        }

        const unites = semestre.unites.filter((unite) => unite.toString() !== uniteId.toString());
        semestre.unites = [...unites];
        const updatedSemestre = await semestre.save();

        return res.json({
            success: true,
            message: 'Unite dissociée du semestre avec succès',
            data: updatedSemestre
        });

    } catch (error: any) {
        console.error('Erreur lors de la dissociation du semestre:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

export default router;