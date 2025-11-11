import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/note-controller';

const router = Router();

router.get('/', getNotes);
router.post('/', createNote);
router.patch('/update/:id', updateNote);
router.delete('/delete/:id', deleteNote);

export default router;
