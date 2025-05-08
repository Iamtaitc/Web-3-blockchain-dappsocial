/**
 * Định dạng thời gian tương đối (ví dụ: "2 phút trước")
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
  
    if (diffSecs < 60) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 30) {
      return `${diffDays} ngày trước`;
    } else if (diffMonths < 12) {
      return `${diffMonths} tháng trước`;
    } else {
      return `${diffYears} năm trước`;
    }
  };
  
  /**
   * Định dạng thời gian chi tiết (ví dụ: "21:30 25/12/2023")
   */
  export const formatDetailedTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
  
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };