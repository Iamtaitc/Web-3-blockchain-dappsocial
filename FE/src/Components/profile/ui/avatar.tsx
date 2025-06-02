"use client"

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../../lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    username?: string; // Thêm prop username để tạo avatar động
  }
>(({ className, username = "User", ...props }, ref) => {
  // Hàm lấy chữ cái đầu của tên
  const getInitials = (name: string) => {
    if (!name) return "U"; // Nếu không có tên, trả về chữ "U" mặc định
    const words = name.trim().split(" ");
    const initials = words
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
    return initials.slice(0, 2); // Lấy tối đa 2 chữ cái
  };

  // Tạo màu nền ngẫu nhiên dựa trên tên
  const getBackgroundColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = "#" + ((hash & 0x00ffffff) | 0x808080).toString(16).padStart(6, "0");
    return color;
  };

  const initials = getInitials(username);
  const backgroundColor = getBackgroundColor(username);

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-lg font-medium",
        className
      )}
      style={{ backgroundColor: backgroundColor }} // Áp dụng màu nền động
      {...props}
    >
      {initials}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };