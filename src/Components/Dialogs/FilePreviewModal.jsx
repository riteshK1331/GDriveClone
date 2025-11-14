import React from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

export default function FilePreviewModal({ file, folders, open, onClose }) {
  const getFileType = (fileName) => {
    const ext = fileName?.split('.')?.pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    if (['pdf'].includes(ext)) return 'pdf'
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(ext)) return 'text'
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'audio'
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office'
    return 'unknown'
  }

  const getFileUrl = (fileObj) => {
    if (fileObj.parent) {
      const folder = folders.find(f => f.id === fileObj.parent)
      if (folder) {
        const safeName = folder.name.replace(/[^a-z0-9-_ ]/gi, '_')
        const diskName = fileObj.diskName || fileObj.name
        return `/${safeName}/${diskName}`
      }
    }
    const diskName = fileObj.diskName || fileObj.name
    return `/uploads/${diskName}`
  }

  const renderPreviewContent = () => {
    if (!file) return null

    const fileType = getFileType(file.name)
    
    if (fileType === 'image') {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src={getFileUrl(file)} 
            alt={file.name}
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </Box>
      )
    }
    
    if (fileType === 'pdf') {
      return (
        <Box sx={{ width: '100%', height: '600px' }}>
          <iframe
            src={getFileUrl(file)}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Box>
      )
    }
    
    if (fileType === 'video') {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <video 
            width="100%" 
            height="auto" 
            controls
            style={{ maxHeight: '500px' }}
          >
            <source src={getFileUrl(file)} />
            Your browser does not support the video tag.
          </video>
        </Box>
      )
    }
    
    if (fileType === 'audio') {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <audio width="100%" controls style={{ width: '100%' }}>
            <source src={getFileUrl(file)} />
            Your browser does not support the audio element.
          </audio>
        </Box>
      )
    }
    
    if (fileType === 'text') {
      const folder = file.parent ? folders.find(f => f.id === file.parent) : null
      const safeName = folder ? folder.name.replace(/[^a-z0-9-_ ]/gi, '_') : ''
      const diskName = file.diskName || file.name
      const editorUrl = `${window.location.origin}/editor.html?folder=${encodeURIComponent(safeName)}&disk=${encodeURIComponent(diskName)}&name=${encodeURIComponent(file.name)}`

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1,
            maxHeight: '400px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <Typography variant="caption">Text preview not yet available in modal. Use editor to view/edit the file.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => window.open(editorUrl, '_blank')}>Open in Editor</Button>
            <Button variant="outlined" onClick={() => { navigator.clipboard?.writeText(editorUrl); }}>Copy Editor Link</Button>
          </Box>
        </Box>
      )
    }
    
    if (fileType === 'office') {
      const folder = file.parent ? folders.find(f => f.id === file.parent) : null
      const safeName = folder ? folder.name.replace(/[^a-z0-9-_ ]/gi, '_') : ''
      const diskName = file.diskName || file.name
      const filePath = folder ? `/${safeName}/${diskName}` : `/uploads/${diskName}`
      const officeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + filePath)}`

      return (
        <Box sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">{file.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => window.open(officeViewer, '_blank')}>Open in Office Online</Button>
            <Button variant="outlined" onClick={() => { window.open(`${window.location.origin}${filePath}`, '_blank') }}>Open Raw</Button>
          </Box>
          <Typography variant="caption" color="text.secondary">The Office Online viewer URL includes the folder and filename.</Typography>
        </Box>
      )
    }
    
    // Unknown file type
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This file type cannot be previewed.
        </Typography>
      </Box>
    )
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {file?.name}
        <IconButton onClick={onClose} size="small">
          <Typography fontSize="1.5rem">×</Typography>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {renderPreviewContent()}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  )
}
