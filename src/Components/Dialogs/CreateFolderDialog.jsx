import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useDispatch, useSelector } from 'react-redux'
import { addFolder, deleteFolder, fetchFilesData } from '../../store/files/filesSlice'

export default function CreateFolderDialog({ open, onClose }) {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const folders = useSelector(state => state.files.folders)

  const handleCreateFolder = async () => {
    // Validation
    const trimmedName = folderName.trim()
    if (!trimmedName) {
      setError('Folder name cannot be empty')
      return
    }

    if (trimmedName.length > 50) {
      setError('Folder name must be less than 50 characters')
      return
    }

    // Check for duplicate folder names
    if (folders.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A folder with this name already exists')
      return
    }

    // Dispatch Redux action to add folder optimistically
    const newFolderId = dispatch(addFolder(trimmedName)).payload.id

    // Persist to public/data/files.json via API call on the upload server
    try {
      const response = await fetch('http://localhost:5001/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newFolderId, name: trimmedName }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          // folder exists on disk; rollback optimistic folder and surface error
          dispatch(deleteFolder(newFolderId))
          setError('A folder with this name already exists on disk')
        } else {
          // generic failure: rollback optimistic add and show message
          dispatch(deleteFolder(newFolderId))
          setError('Failed to persist folder to disk')
        }
        // ensure we have authoritative state
        dispatch(fetchFilesData())
        return
      }

      // success -> refresh authoritative state so UI matches files.json
      dispatch(fetchFilesData())
    } catch (err) {
      // Network error; rollback optimistic add and notify user
      dispatch(deleteFolder(newFolderId))
      setError('Network error while persisting folder')
      console.warn('Network error persisting folder:', err.message)
      // attempt to refresh authoritative state
      dispatch(fetchFilesData())
      return
    }

    // Close dialog and reset
    setFolderName('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setFolderName('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          fullWidth
          label="Folder Name"
          placeholder="e.g., My Documents"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateFolder()
          }}
          error={!!error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreateFolder} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
