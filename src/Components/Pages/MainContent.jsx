import React, { useMemo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import IconButton from '@mui/material/IconButton'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useDispatch } from 'react-redux'
import { addFileFromServer, deleteFile, fetchFilesData, deleteFolder } from '../../store/files/filesSlice'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FilePreviewModal from '../Dialogs/FilePreviewModal'



export default function MainContent() {
  const [currentFolder, setCurrentFolder] = useState(null) // null -> root
  const [selectedFiles, setSelectedFiles] = useState({})
  const [starred, setStarred] = useState({})
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null)
  const [selectedFileId, setSelectedFileId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)
  const [folderMenuAnchor, setFolderMenuAnchor] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [fileToPreview, setFileToPreview] = useState(null)

  // Use Redux state instead of local samples when available
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const reduxFolders = useSelector(state => state.files.folders)
  const reduxFiles = useSelector(state => state.files.files)

  useEffect(() => {
    // attempt to fetch JSON data from public/data/files.json (handled by Redux in store as well)
    fetch('/data/files.json').then(r => r.json()).then(data => {
      if (data) {
        setFolders(data.folders || [])
        setFiles(data.files || [])
      }
    }).catch(() => {
      // fallback to sample data
    })
  }, [])

  // Use Redux state if available
  useEffect(() => {
    if (reduxFolders.length > 0) setFolders(reduxFolders)
    if (reduxFiles.length > 0) setFiles(reduxFiles)
  }, [reduxFolders, reduxFiles])

  const visibleFiles = useMemo(() => files.filter(f => (currentFolder ? f.parent === currentFolder : true)), [files, currentFolder])

  const toggleSelect = (id) => {
    setSelectedFiles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleStar = (id) => {
    setStarred(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const openFolder = (id) => {
    setCurrentFolder(id)
    // clear selection when navigating
    setSelectedFiles({})
  }

  const goUp = () => setCurrentFolder(null)

  const dispatch = useDispatch()

  const fileInputRef = React.useRef(null)

  const handleUploadFiles = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const fd = new FormData()
      fd.append('file', f)
      if (currentFolder) fd.append('parent', currentFolder)

      try {
        const res = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          body: fd,
        })

        if (!res.ok) {
          console.error('Upload failed', await res.text())
          continue
        }

        const body = await res.json()
        if (body && body.file) {
          // add to redux state so UI updates
          dispatch(addFileFromServer(body.file))
          // refresh authoritative state from files.json so UI + disk stay in sync
          dispatch(fetchFilesData())
          // also update local files list for immediate view (if not using redux-driven view)
          setFiles(prev => [body.file, ...prev])
        }
      } catch (err) {
        console.error('Upload error', err)
      }
    }

    // reset input
    e.target.value = null
  }

  const handleExportState = () => {
    const state = { folders, files }
    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `drive-state-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileMenuOpen = (event, fileId) => {
    setFileMenuAnchor(event.currentTarget)
    setSelectedFileId(fileId)
  }

  const handleFileMenuClose = () => {
    setFileMenuAnchor(null)
    setSelectedFileId(null)
  }

  const handleCopyFile = async () => {
    if (!selectedFileId) return
    const file = files.find(f => f.id === selectedFileId)
    if (file) {
      const ext = file.name.match(/(\.[^.]+)$/)?.[0] || ''
      const baseName = file.name.replace(/(\.[^.]+)$/, '')
      const copyName = `${baseName} - Copy${ext}`
      
      try {
        // Request copy from server
        const res = await fetch('http://localhost:5001/api/files/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: selectedFileId, newName: copyName })
        })
        
        if (!res.ok) {
          console.error('Copy failed:', await res.text())
          return
        }
        
        const body = await res.json()
        if (body && body.file) {
          // Add copied file to Redux state
          dispatch(addFileFromServer(body.file))
          // Refresh state from server to ensure sync
          dispatch(fetchFilesData())
        }
      } catch (err) {
        console.error('Copy error:', err)
      }
    }
    handleFileMenuClose()
  }

  const handleDeleteFile = async () => {
    if (!selectedFileId) return
    
    const file = files.find(f => f.id === selectedFileId)
    setFileToDelete(file)
    setDeleteConfirmOpen(true)
    handleFileMenuClose()
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    
    // Delete from Redux state
    dispatch(deleteFile(fileToDelete.id))
    
    // Delete from server
    try {
      await fetch(`http://localhost:5001/api/files/${fileToDelete.id}`, {
        method: 'DELETE',
      })
      // Refresh state from disk
      dispatch(fetchFilesData())
    } catch (err) {
      console.error('Delete error', err)
      // Roll back by refreshing
      dispatch(fetchFilesData())
    }
    
    setDeleteConfirmOpen(false)
    setFileToDelete(null)
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setFileToDelete(null)
  }

  const handleFolderMenuOpen = (event, folderId) => {
    event.stopPropagation()
    setFolderMenuAnchor(event.currentTarget)
    setSelectedFolderId(folderId)
  }

  const handleFolderMenuClose = () => {
    setFolderMenuAnchor(null)
    setSelectedFolderId(null)
  }

  const handleDeleteFolder = () => {
    if (!selectedFolderId) return
    
    const folder = folders.find(f => f.id === selectedFolderId)
    setFolderToDelete(folder)
    setDeleteFolderConfirmOpen(true)
    handleFolderMenuClose()
  }

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return
    
    // Delete from Redux state
    dispatch(deleteFolder(folderToDelete.id))
    
    // Delete from server (which will also delete all files in the folder)
    try {
      await fetch(`http://localhost:5001/api/folders/${folderToDelete.id}`, {
        method: 'DELETE',
      })
      // Refresh state from disk
      dispatch(fetchFilesData())
    } catch (err) {
      console.error('Delete folder error', err)
      // Roll back by refreshing
      dispatch(fetchFilesData())
    }
    
    setDeleteFolderConfirmOpen(false)
    setFolderToDelete(null)
  }

  const handleCancelDeleteFolder = () => {
    setDeleteFolderConfirmOpen(false)
    setFolderToDelete(null)
  }

  const handleOpenPreview = (file) => {
    setFileToPreview(file)
    setPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
    setFileToPreview(null)
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={goUp} sx={{ cursor: 'pointer' }}>
            My Drive
          </Link>
          {currentFolder && (
            <Typography color="text.primary">{folders.find(f => f.id === currentFolder)?.name}</Typography>
          )}
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple onChange={handleUploadFiles} />
          <Button variant="outlined" size="small" startIcon={<SaveAltIcon />} onClick={handleExportState}>Export</Button>
          <Button variant="outlined" size="small" sx={{ mr: 1 }}>Sort</Button>
          <Button variant="contained" size="small" onClick={() => fileInputRef.current?.click()}>Upload</Button>
        </Box>
      </Box>

      {/* Folders grid */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {folders.map(folder => (
          <Grid item key={folder.id} xs={12} sm={6} md={3}>
            <Card 
              onDoubleClick={() => openFolder(folder.id)} 
              sx={{ cursor: 'pointer', position: 'relative' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '12px !important' }}>
                <FolderIcon sx={{ fontSize: 36, color: '#fbbc04' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">{folder.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{files.filter(f=>f.parent===folder.id).length} items</Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleFolderMenuOpen(e, folder.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper>
        <List>
          {visibleFiles.map(file => (
            <React.Fragment key={file.id}>
              <ListItem 
                sx={{ pl: 2, cursor: 'pointer' }}
                onDoubleClick={() => handleOpenPreview(file)}
              >
                <Checkbox edge="start" checked={!!selectedFiles[file.id]} onChange={() => toggleSelect(file.id)} />
                <ListItemAvatar>
                  <Avatar variant="rounded"><InsertDriveFileIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText primary={file.name} secondary={`Modified ${file.modified} • ${file.owner} • ${file.size}`} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => toggleStar(file.id)} aria-label="star">
                    {starred[file.id] ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton edge="end" onClick={(e) => handleFileMenuOpen(e, file.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* File action menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={handleFileMenuClose}
      >
        <MenuItem onClick={handleCopyFile}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleDeleteFile}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete File?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{fileToDelete?.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Folder action menu */}
      <Menu
        anchorEl={folderMenuAnchor}
        open={Boolean(folderMenuAnchor)}
        onClose={handleFolderMenuClose}
      >
        <MenuItem onClick={handleDeleteFolder}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete folder confirmation dialog */}
      <Dialog open={deleteFolderConfirmOpen} onClose={handleCancelDeleteFolder}>
        <DialogTitle>Delete Folder?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{folderToDelete?.name}</strong> and all {files.filter(f => f.parent === folderToDelete?.id).length} files inside it? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteFolder} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDeleteFolder} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal 
        file={fileToPreview}
        folders={folders}
        open={previewOpen}
        onClose={handleClosePreview}
      />
    </Box>
  )
}

