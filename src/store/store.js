import { configureStore } from '@reduxjs/toolkit'
import filesReducer from './files/filesSlice'

export const store = configureStore({
  reducer: {
    files: filesReducer,
  },
})

export default store
