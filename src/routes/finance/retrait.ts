import express, { Router, Request, Response } from "express";
import Depense from "../../models/Depense";
import { randomUUID } from "crypto";

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            agentId,
            anneeId,
            service,
            amount
        } = req.body;

        if (!agentId || !anneeId || !service || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs sont requis'
            });
        }

        //Generate UUID as orderNumber
        const orderNumber = randomUUID().slice(0, 8);

        const depense = new Depense({
            agentId,
            anneeId,
            service,
            amount,
            status: 'Pending',
            orderNumber: orderNumber
        });

        await depense.save();

        return res.status(200).json({
            success: true,
            message: 'Retrait enregistré avec succès',
            data: depense
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/user/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const depenses = await Depense.find({ agentId: id })
            .populate('agentId')
            .populate('anneeId');

        return res.status(200).json({
            success: true,
            message: 'Retraits trouvés avec succès',
            data: depenses
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/all', async (req: Request, res: Response) => {
    try {
        const depenses = await Depense.find()
            .populate('agentId')
            .populate('anneeId');

        return res.status(200).json({
            success: true,
            message: 'Retraits trouvés avec succès',
            data: depenses
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/annee/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const depenses = await Depense.find({ anneeId: id })
            .populate('agentId')
            .populate('anneeId');

        return res.status(200).json({
            success: true,
            message: 'Retraits trouvés avec succès',
            data: depenses
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.put('/update/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const depense = await Depense.findByIdAndUpdate(id, req.body, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Retrait mis à jour avec succès',
            data: depense
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID requis'
            });
        }

        const depense = await Depense.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Retrait supprimé avec succès',
            data: depense
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

export default router;
