import './App.css';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


export default function InfoDialog() {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className='refresh'>
            <button className='buttonHeader' onClick={handleClickOpen}><InfoOutlinedIcon></InfoOutlinedIcon></button>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <p>Created by James Buzaid, 2022</p>
                </DialogContent>
            </Dialog>
        </div>

    )
}