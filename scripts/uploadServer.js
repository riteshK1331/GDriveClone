const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
const PORT = process.env.UPLOAD_SERVER_PORT || 5001

// Ensure public/data exists
const dataPath = path.join(__dirname, '../public/data/files.json')
const publicPath = path.join(__dirname, '../public')

// Storage for multer - we'll write file ourselves to desired folder
const upload = multer({ storage: multer.memoryStorage() })

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const parent = req.body.parent || null

    // Read files.json
    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    // Determine destination folder name
    let destDir = path.join(publicPath, 'uploads') // default
    if (parent) {
      const folder = data.folders.find(f => f.id === parent)
      if (folder) {
        // sanitize folder name
        const safeName = folder.name.replace(/[^a-z0-9-_ ]/gi, '_')
        destDir = path.join(publicPath, safeName)
      }
    }

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    const filename = `${Date.now()}-${req.file.originalname}`
    const filePath = path.join(destDir, filename)
    
    // Write file to disk
    fs.writeFileSync(filePath, req.file.buffer)
    
    // Verify file was written
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'Failed to write file to disk' })
    }

    // Create file record
    const sizeBytes = req.file.size
    const sizeKB = Math.round(sizeBytes / 1024)
    const sizeLabel = sizeKB < 1024 ? `${sizeKB} KB` : `${(sizeKB / 1024).toFixed(1)} MB`
    const fileRecord = {
      id: `f_${Date.now()}`,
      parent: parent,
      name: req.file.originalname,
      diskName: filename,
      size: sizeLabel,
      modified: new Date().toISOString().slice(0, 10),
      owner: 'You'
    }

    // Update files.json
    data.files.unshift(fileRecord)
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    return res.status(201).json({ success: true, file: fileRecord })
  } catch (err) {
    console.error('Upload error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.post('/api/folders', (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'Missing id or name' })

    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    // append folder
    if (data.folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Folder exists' })
    }

    data.folders.unshift({ id, name })
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    // create folder directory
    const safeName = name.replace(/[^a-z0-9-_ ]/gi, '_')
    const folderPath = path.join(publicPath, safeName)
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true })

    return res.status(201).json({ success: true, id, name })
  } catch (err) {
    console.error('folders API error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.delete('/api/files/:fileId', (req, res) => {
  try {
    const { fileId } = req.params

    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    // Find and remove file record
    const fileIdx = data.files.findIndex(f => f.id === fileId)
    if (fileIdx === -1) {
      return res.status(404).json({ error: 'File not found' })
    }

    const deletedFile = data.files[fileIdx]
    data.files.splice(fileIdx, 1)
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    // Attempt to delete actual file from disk
    if (deletedFile.parent) {
      const folder = data.folders.find(f => f.id === deletedFile.parent)
      if (folder) {
        const safeName = folder.name.replace(/[^a-z0-9-_ ]/gi, '_')
        const folderPath = path.join(publicPath, safeName)
        if (fs.existsSync(folderPath)) {
          const files = fs.readdirSync(folderPath)
          // Find and delete the file that matches the name
          const matchedFile = files.find(f => f.includes(deletedFile.name))
          if (matchedFile) {
            fs.unlinkSync(path.join(folderPath, matchedFile))
          }
        }
      }
    } else {
      // File in uploads folder
      const uploadsPath = path.join(publicPath, 'uploads')
      if (fs.existsSync(uploadsPath)) {
        const files = fs.readdirSync(uploadsPath)
        const matchedFile = files.find(f => f.includes(deletedFile.name))
        if (matchedFile) {
          fs.unlinkSync(path.join(uploadsPath, matchedFile))
        }
      }
    }

    return res.status(200).json({ success: true, id: fileId })
  } catch (err) {
    console.error('Delete file error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.delete('/api/folders/:folderId', (req, res) => {
  try {
    const { folderId } = req.params

    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    // Find the folder to delete
    const folderIdx = data.folders.findIndex(f => f.id === folderId)
    if (folderIdx === -1) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    const folderToDelete = data.folders[folderIdx]

    // Remove folder from folders array
    data.folders.splice(folderIdx, 1)

    // Remove all files in this folder
    const filesInFolder = data.files.filter(f => f.parent === folderId)
    data.files = data.files.filter(f => f.parent !== folderId)

    // Write updated files.json
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    // Delete folder directory from disk
    const safeName = folderToDelete.name.replace(/[^a-z0-9-_ ]/gi, '_')
    const folderPath = path.join(publicPath, safeName)
    if (fs.existsSync(folderPath)) {
      // Remove all files in the folder first
      const filesInDir = fs.readdirSync(folderPath)
      filesInDir.forEach(file => {
        fs.unlinkSync(path.join(folderPath, file))
      })
      // Remove the folder directory
      fs.rmdirSync(folderPath)
    }

    return res.status(200).json({ success: true, id: folderId, deletedCount: filesInFolder.length })
  } catch (err) {
    console.error('Delete folder error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.post('/api/files/copy', (req, res) => {
  try {
    const { fileId, newName } = req.body
    if (!fileId || !newName) {
      return res.status(400).json({ error: 'Missing fileId or newName' })
    }

    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    // Find the file to copy
    const fileToClone = data.files.find(f => f.id === fileId)
    if (!fileToClone) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Determine source and destination directories
    let srcDir = path.join(publicPath, 'uploads')
    let destDir = path.join(publicPath, 'uploads')

    if (fileToClone.parent) {
      const folder = data.folders.find(f => f.id === fileToClone.parent)
      if (folder) {
        const safeName = folder.name.replace(/[^a-z0-9-_ ]/gi, '_')
        srcDir = path.join(publicPath, safeName)
        destDir = path.join(publicPath, safeName)
      }
    }

    // Find and copy the actual file from disk
    // Look for files matching the original file name pattern
    let srcFile = null
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir)
      const matchedFile = files.find(f => f.includes(fileToClone.name))
      if (matchedFile) {
        srcFile = path.join(srcDir, matchedFile)
      }
    }

    if (!srcFile || !fs.existsSync(srcFile)) {
      return res.status(404).json({ error: 'Source file not found on disk' })
    }

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

    // Copy the file with a new timestamp
    const filename = `${Date.now()}-${newName}`
    const destFile = path.join(destDir, filename)
    fs.copyFileSync(srcFile, destFile)

    // Create a new file record with copied metadata
    const copiedFile = {
      id: `f_${Date.now()}`,
      parent: fileToClone.parent,
      name: newName,
      diskName: filename,
      size: fileToClone.size,
      modified: new Date().toISOString().slice(0, 10),
      owner: fileToClone.owner
    }

    // Add to files.json
    data.files.unshift(copiedFile)
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    return res.status(201).json({ success: true, file: copiedFile })
  } catch (err) {
    console.error('Copy file error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.post('/api/files/save', (req, res) => {
  try {
    const { folder, diskName, content, name } = req.body
    if (!diskName) return res.status(400).json({ error: 'Missing diskName' })

    // Determine file path
    let filePath = path.join(publicPath, 'uploads', diskName)
    if (folder) {
      const safeName = folder.replace(/[^a-z0-9-_ ]/gi, '_')
      filePath = path.join(publicPath, safeName, diskName)
    }

    // Ensure file exists or allow creating it
    fs.writeFileSync(filePath, content, 'utf8')

    // Update modified date in files.json if record exists
    let data = { folders: [], files: [] }
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }

    const fileRecord = data.files.find(f => (f.diskName === diskName) || (f.name === diskName) || (f.name === name))
    if (fileRecord) {
      fileRecord.modified = new Date().toISOString().slice(0, 10)
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    }

    return res.status(200).json({ success: true, path: filePath })
  } catch (err) {
    console.error('Save file error', err)
    return res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('  POST http://localhost:5001/api/upload - upload a file')
  console.log('  POST http://localhost:5001/api/folders - create a folder')
  console.log('  DELETE http://localhost:5001/api/folders/:folderId - delete a folder and its files')
  console.log('  POST http://localhost:5001/api/files/copy - copy a file')
  console.log('  DELETE http://localhost:5001/api/files/:fileId - delete a file')
  console.log('  POST http://localhost:5001/api/files/save - save edited text file')
})
