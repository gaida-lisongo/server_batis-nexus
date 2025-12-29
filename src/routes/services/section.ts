import express, { Router, Request, Response } from "express";
import { Section } from "../../models/Mention";
import { Types } from "mongoose";

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const section = new Section(req.body);
        const savedSection = await section.save();
        return res.json({
            success: true,
            message: 'Section créée avec succès',
            data: savedSection
        });
    } catch (error: any) {
        console.error('Erreur lors de la création de la section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

router.patch('/add/:sectionId', async (req: Request, res: Response) => {
    try {
        const sectionId = req.params;
        const { agentId, role } = req.body;

        const section = await Section.findById(sectionId);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section non trouvée'
            });
        }

        const isExisted = section?.bureau.find((bureau) => bureau.agent.toString() === agentId.toString());

        if (isExisted) {
            return res.status(400).json({
                success: false,
                message: 'Agent déjà ajouté à la section'
            });
        }

        section.bureau.push({ agent: agentId, role });
        const updatedSection = await section.save();

        return res.json({
            success: true,
            message: 'Agent ajouté à la section avec succès',
            data: updatedSection
        });
    } catch (error: any) {
        console.error('Erreur lors de l\'ajout de l\'agent à la section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

router.patch('/remove/:sectionId', async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const { bureauId } = req.body;

        console.log("BureauId", bureauId)

        const section = await Section.findById(sectionId);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section non trouvée'
            });
        }

        const isExisted = section?.bureau.find((bureau) => bureau?._id?.toString() === bureauId.toString());

        if (!isExisted) {
            return res.status(400).json({
                success: false,
                message: 'Agent non trouvé dans la section'
            });
        }

        const bureau = section.bureau.filter((bureau) => bureau?._id?.toString() !== bureauId.toString());
        section.bureau = [...bureau];
        const updatedSection = await section.save();

        return res.json({
            success: true,
            message: 'Agent supprimé de la section avec succès',
            data: updatedSection
        });
    } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'agent de la section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {



        const { sectionId, populate } = req.query;

        // Convertir le paramètre populate en tableau
        const populateFields = populate ? populate.toString().split(',') : ['filieres', 'bureau.agent'];

        const sections = sectionId ? await Section.findById(sectionId).populate(populateFields) : await Section.find().populate(populateFields);

        if (sections) {
            return res.json({
                success: true,
                message: 'Sections récupérées avec succès',
                data: sections
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Sections non trouvées'
            });
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération des sections:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

router.put('/', async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;
        const section = await Section.findByIdAndUpdate(_id, req.body, { new: true });
        if (section) {
            return res.json({
                success: true,
                message: 'Section mise à jour avec succès',
                data: section
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Section non trouvée'
            });
        }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de la section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

router.delete('/', async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;
        const section = await Section.findByIdAndDelete(_id);
        if (section) {
            return res.json({
                success: true,
                message: 'Section supprimée avec succès',
                data: section
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Section non trouvée'
            });
        }
    } catch (error: any) {
        console.error('Erreur lors de la suppression de la section:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erreur interne du serveur'
        });
    }
});

export default router;
