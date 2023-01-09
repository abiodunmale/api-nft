import express from 'express';
import { about, generateNft, getNftMetadata, deleteNft, updateNft  } from '../controllers/nft.js';

const router = express.Router();

router.get('/', about);
router.post('/generate', generateNft);
router.get('/metadata/:id', getNftMetadata);
router.delete('/:id', deleteNft);
router.put('/:id', updateNft);

export default router;