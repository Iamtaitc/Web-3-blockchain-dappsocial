import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../profile/ui/avatar";

interface PostAvatarFallbackProps {
  avatarURI: string | undefined;
  username: string | undefined;
  size?: "medium" | "large";
}

/**
 * Component hiển thị avatar người dùng với kích thước lớn cho các bài đăng không có hình ảnh
 */
const PostAvatarFallback: React.FC<PostAvatarFallbackProps> = ({ 
  avatarURI, 
  username, 
  size = "large" 
}) => {
  const sizeClass = size === "large" ? "h-48 w-48 md:h-64 md:w-64" : "h-32 w-32 md:h-40 md:w-40";
  const defaultAvatar = "/placeholder.svg?height=256&width=256";
  
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`relative ${sizeClass} transition-all duration-300 ease-in-out`}>
        <Avatar className={`${sizeClass} border-2 border-gray-100 shadow-md`}>
          <AvatarImage
            src={avatarURI || defaultAvatar}
            alt={username || "Người dùng"}
          />
          <AvatarFallback className="text-3xl bg-gradient-to-br from-gray-200 to-gray-300">
            {username?.substring(0, 2).toUpperCase() || "UN"}
          </AvatarFallback>
        </Avatar>
        
        {/* Hiệu ứng hào quang nhẹ */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse -z-10 blur-md"></div>
      </div>
    </div>
  );
};

export default PostAvatarFallback;