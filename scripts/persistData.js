#!/usr/bin/env node

/**
 * Script to persist Redux state to public/data/files.json
 * and create corresponding folder directories in public/
 * 
 * Usage:
 *   node scripts/persistData.js <path-to-exported-state.json>
 * 
 * Example:
 *   node scripts/persistData.js ./exported-state.json
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/persistData.js <path-to-exported-state.json>')
  console.error('Example: node scripts/persistData.js ./exported-state.json')
  process.exit(1)
}

const inputFile = args[0]
const publicDataPath = path.join(__dirname, '../public/data/files.json')
const publicPath = path.join(__dirname, '../public')

// Ensure public/data directory exists
const publicDataDir = path.dirname(publicDataPath)
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true })
}

try {
  // Read input state
  const inputState = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  const { folders = [], files = [] } = inputState

  // Validate structure
  if (!Array.isArray(folders) || !Array.isArray(files)) {
    throw new Error('Input state must contain folders[] and files[] arrays')
  }

  // Write to public/data/files.json
  const data = { folders, files }
  fs.writeFileSync(publicDataPath, JSON.stringify(data, null, 2))
  console.log(`✓ Updated ${publicDataPath}`)

  // Create folder directories in public/
  folders.forEach(folder => {
    const folderPath = path.join(publicPath, folder.name)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
      console.log(`✓ Created folder: ${folderPath}`)
    } else {
      console.log(`  (Folder already exists: ${folderPath})`)
    }
  })

  console.log('\nSync complete!')
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
