import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../utils/counterSlice'
import authReduucer from '../utils/authSlice'
export const store = configureStore({
  reducer: {
    counter:counterReducer,
    auth:authReduucer
  },
})