import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { RootState } from '../store'

// Hook tùy chỉnh để sử dụng useSelector với TypeScript
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector