import React, { useRef } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AddIcon from '@mui/icons-material/Add'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
import CreateFolderDialog from '../Dialogs/CreateFolderDialog'
import { useDispatch } from 'react-redux'
import { addFileFromServer, fetchFilesData } from '../../store/files/filesSlice'

export default function CreateButton() {
	const [anchorEl, setAnchorEl] = React.useState(null)
	const [showFolderDialog, setShowFolderDialog] = React.useState(false)
	const [showUploadDialog, setShowUploadDialog] = React.useState(false)
	const fileInputRef = useRef(null)

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleMenuAction = (action) => {
		handleClose()

		switch (action) {
			case 'folder':
				setShowFolderDialog(true)
				break
			case 'file':
				fileInputRef.current?.click()
				break
			case 'upload':
				setShowUploadDialog(true)
				break
			default:
				console.warn('Unknown action:', action)
		}
	}

	const dispatch = useDispatch()

	const handleFileChange = async (e) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		for (let i = 0; i < files.length; i++) {
			const f = files[i]
			const fd = new FormData()
			fd.append('file', f)
			// no parent by default; you can add parent id here if available
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
					dispatch(addFileFromServer(body.file))
					// refresh authoritative state from files.json so UI + disk stay in sync
					dispatch(fetchFilesData())
				}
			} catch (err) {
				console.error('Upload error', err)
			}
		}
		// reset input so selecting same file again triggers change
		e.target.value = null
	}

	return (
		<div style={{ padding: '12px 12px 12px 12px' }}>
			<Button
				variant="contained"
				startIcon={<AddIcon />}
				onClick={handleClick}
				fullWidth
				sx={{ textTransform: 'none', backgroundColor: '#1a73e8' }}
			>
				New
			</Button>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{ sx: { minWidth: 220 } }}
			>
				<MenuItem onClick={() => handleMenuAction('folder')}>
					<ListItemIcon>
						<CreateNewFolderIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Folder</ListItemText>
				</MenuItem>

				<MenuItem onClick={() => handleMenuAction('file')}>
					<ListItemIcon>
						<UploadFileIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>File upload</ListItemText>
				</MenuItem>

				<MenuItem onClick={() => handleMenuAction('folder-upload')}>
					<ListItemIcon>
						<DriveFolderUploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Folder upload</ListItemText>
				</MenuItem>
			</Menu>

			<input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />

			<CreateFolderDialog open={showFolderDialog} onClose={() => setShowFolderDialog(false)} />
		</div>
	)
}
