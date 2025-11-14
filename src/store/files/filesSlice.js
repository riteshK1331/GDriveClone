import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'

// Thunk to load initial data from public JSON
export const fetchFilesData = createAsyncThunk('files/fetchData', async () => {
  const res = await fetch('/data/files.json')
  if (!res.ok) throw new Error('Failed to load files.json')
  return res.json()
})

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    folders: [],
    files: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addFolder: {
      reducer(state, action) {
        state.folders.unshift(action.payload)
      },
      prepare(name) {
        return { payload: { id: nanoid(), name } }
      }
    },
    addFile: {
      reducer(state, action) {
        state.files.unshift(action.payload)
      },
      prepare({ parent, name, size = '0 KB', owner = 'You' }) {
        return { payload: { id: nanoid(), parent, name, size, modified: new Date().toISOString().slice(0,10), owner } }
      }
    },
    updateFile(state, action) {
      const idx = state.files.findIndex(f => f.id === action.payload.id)
      if (idx !== -1) state.files[idx] = { ...state.files[idx], ...action.payload }
    },
    deleteFile(state, action) {
      state.files = state.files.filter(f => f.id !== action.payload)
    },
    deleteFolder(state, action) {
      const id = action.payload
      state.folders = state.folders.filter(f => f.id !== id)
      state.files = state.files.filter(f => f.parent !== id)
    }
    ,
    // Accept a full file record (e.g. returned from server) and add it
    addFileFromServer(state, action) {
      state.files.unshift(action.payload)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFilesData.pending, (state) => { state.status = 'loading' })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.folders = action.payload.folders || []
        state.files = action.payload.files || []
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export const { addFolder, addFile, updateFile, deleteFile, deleteFolder,addFileFromServer } = filesSlice.actions

// Selector to export current state as JSON
export const selectFilesState = (state) => ({
  folders: state.files.folders,
  files: state.files.files,
})

export default filesSlice.reducer
