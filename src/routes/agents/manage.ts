import express, { Router, Request, Response } from "express";
import Agent from "../../models/Agent";
import multer from 'multer';
import crypto from 'crypto';

const router: Router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 5MB limit
    }
});

router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find();

        if (!agents) {
            return res.status(404).json({
                success: false,
                error: 'Aucun agent trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Agents récupérés avec succès',
            data: agents
        });
    } catch (error: any) {
        console.error('Erreur lors de la récupération des agents:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
})

router.post('/', async (req, res) => {
    try {
        const agent = new Agent(req.body);
        const savedAgent = await agent.save();

        return res.status(201).json({
            success: true,
            message: 'Agent créé avec succès',
            data: savedAgent
        });
    } catch (error: any) {
        console.error('Erreur lors de la création de l\'agent:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
})

// Route to upload agent photo
router.put('/photo', upload.single('photo'), async (req: Request & { file?: Express.Multer.File | undefined }, res: Response) => {
    try {
        const { agentId } = req.body;

        if (!agentId) {

            return res.status(400).json({ success: false, error: 'ID de l\'agent requis' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Aucune image fournie' });
        }

        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent non trouvé' });
        }

        // 1. Cloudinary Credentials
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({ success: false, error: 'Configuration Cloudinary manquante' });
        }

        // 2. Prepare signature
        const timestamp = Math.round(new Date().getTime() / 1000);
        const public_id = `agent_${agentId}_${timestamp}`;
        const folder = 'agents_photos';

        const paramsToSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        // 3. Create FormData for Cloudinary
        const formData = new FormData();
        formData.append('file', `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('public_id', public_id);
        formData.append('folder', folder);

        // 4. Send to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cloudinary error:', data);
            return res.status(500).json({ success: false, error: 'Erreur lors de l\'upload vers Cloudinary' });
        }

        // 5. Update Agent in database
        agent.photo = data.secure_url;
        await agent.save();

        return res.status(200).json({
            success: true,
            message: 'Photo mise à jour avec succès',
            data: {
                photo: data.secure_url,
                agent: agent
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.put('/', async (req, res) => {
    try {
        const agent = await Agent.findByIdAndUpdate(
            req.body._id,
            req.body,
            { new: true }
        )
            .populate('grade');

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Agent mis à jour avec succès',
            data: agent
        });
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'agent:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

router.delete('/', async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.body._id);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Agent supprimé avec succès',
            data: agent
        });
    } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'agent:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
})

export default router
