/**
 * Tiện ích xử lý và nén hình ảnh
 */

interface CompressOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  }
  
  /**
   * Nén hình ảnh để giảm kích thước
   * @param file File hình ảnh cần nén
   * @param options Tùy chọn nén (maxWidth, maxHeight, quality)
   * @returns File đã nén
   */
  export const compressImage = async (file: File, options: CompressOptions = {}): Promise<File> => {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options
  
    return new Promise((resolve, reject) => {
      // Kiểm tra xem file có phải là hình ảnh không
      if (!file.type.startsWith("image/")) {
        return resolve(file) // Nếu không phải hình ảnh, trả về file gốc
      }
  
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
  
        img.onload = () => {
          // Tính toán kích thước mới để giữ tỷ lệ
          let width = img.width
          let height = img.height
  
          // Tính tỷ lệ nén
          const ratio = Math.min(maxWidth / width, maxHeight / height)
  
          // Nếu hình ảnh lớn hơn kích thước tối đa, giảm kích thước
          if (ratio < 1) {
            width = Math.floor(width * ratio)
            height = Math.floor(height * ratio)
          }
  
          // Tạo canvas để vẽ hình ảnh đã resize
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
  
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            return reject(new Error("Không thể tạo context canvas"))
          }
  
          // Vẽ hình ảnh lên canvas
          ctx.drawImage(img, 0, 0, width, height)
  
          // Chuyển đổi canvas thành blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Không thể tạo blob từ canvas"))
              }
  
              // Tạo file mới từ blob
              const newFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
  
              console.log(`Đã nén hình ảnh từ ${formatFileSize(file.size)} xuống ${formatFileSize(newFile.size)}`)
              resolve(newFile)
            },
            // Ưu tiên định dạng JPEG cho kích thước nhỏ hơn
            file.type === "image/png" ? "image/jpeg" : file.type,
            quality,
          )
        }
  
        img.onerror = () => {
          reject(new Error("Lỗi khi tải hình ảnh"))
        }
      }
  
      reader.onerror = () => {
        reject(new Error("Lỗi khi đọc file"))
      }
    })
  }
  
  /**
   * Định dạng kích thước file thành chuỗi dễ đọc (KB, MB)
   * @param bytes Kích thước file tính bằng byte
   * @returns Chuỗi đã định dạng
   */
  export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + " bytes"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB"
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    }
  }
  
  /**
   * Kiểm tra xem file có phải là hình ảnh hợp lệ không
   * @param file File cần kiểm tra
   * @returns true nếu là hình ảnh hợp lệ
   */
  export const isValidImage = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    return validTypes.includes(file.type)
  }
  
  /**
   * Chuyển đổi file thành chuỗi Base64
   * @param file File cần chuyển đổi
   * @returns Promise với chuỗi Base64
   */
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Lấy phần base64 sau dấu phẩy (loại bỏ phần data:image/jpeg;base64,)
        const base64String = reader.result?.toString().split(",")[1]
        resolve(base64String || "")
      }
      reader.onerror = (error) => reject(error)
    })
  }
  