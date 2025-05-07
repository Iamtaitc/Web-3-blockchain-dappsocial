import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'

// Hook tùy chỉnh để sử dụng useDispatch với TypeScript
export const useAppDispatch = () => useDispatch<AppDispatch>()