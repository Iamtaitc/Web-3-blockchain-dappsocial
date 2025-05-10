import boyImage from "../assets/boy.jpg"
import newImage from "../assets/pngtree-background-beautiful-wallpaper-image-picture-image_15491298.jpg"
import avtImage from "../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp"
import sunsetImage from "../assets/sun.jpg"
import seaImage from "../assets/sea.jpeg"
import mountainImage from "../assets/Mountain.jpg"
import cafeImage from "../assets/cafe.webp"
import foodImage from "../assets/food.jpg"
import dogImage from "../assets/dog.jpg"
import type { Comment } from "../components/UI/CommentModal"

export interface PostImage {
  src: string
  title: string
  likes: string
  comments: Array<{ user: string; text: string }>
}

export interface Post {
  id: number
  user: {
    username: string
    avatar: string
  }
  time: string
  title: string
  images: PostImage[]
  likes: string
  comments: string
  commentsList: Comment[]
  isFollowed?: boolean
}

export const posts: Post[] = [
  {
    id: 2,
    user: {
      username: "john_doe",
      avatar: boyImage,
    },
    time: "15 giờ",
    title: "Chuyến đi đáng nhớ!",
    images: [
      {
        src: boyImage,
        title: "Ngày đầu chuyến đi",
        likes: "6k",
        comments: [
          { user: "anna", text: "Nhìn vui quá!" },
          { user: "peter", text: "Đẹp lắm bạn ơi" },
          { user: "lily", text: "Cho mình xin địa điểm với" },
          { user: "anna", text: "Nhìn vui quá!" },
          { user: "peter", text: "Đẹp lắm bạn ơi" },
          { user: "lily", text: "Cho mình xin địa điểm với" },
        ],
      },
  
    ],
    likes: "10k",
    comments: "15",
    commentsList: [
      {
        id: "c1",
        user: "anna",
        text: "Nhìn vui quá!",
        likes: 5,
        replies: [{ user: "john_doe", text: "Cảm ơn bạn! Chuyến đi rất vui" }],
      },
      { id: "c2", user: "peter", text: "Đẹp lắm bạn ơi", likes: 3 },
      { id: "c3", user: "lily", text: "Cho mình xin địa điểm với", likes: 2 },
      { id: "c4", user: "mike", text: "Cảnh đẹp như tranh", likes: 7 },
      { id: "c5", user: "sara", text: "Thích quá đi", likes: 1 },
    ],
    isFollowed: true,
  },
  {
    id: 3,
    user: {
      username: "mary_jane",
      avatar: newImage,
    },
    time: "8 giờ",
    title: "Một góc phố cổ",
    images: [
      {
        src: newImage,
        title: "Góc phố yên bình",
        likes: "2k",
        comments: [
          { user: "tom", text: "Nhìn yên bình ghê" },
          { user: "jane", text: "Thích kiểu cổ kính thế này" },
        ],
      },
     
    ],
    likes: "5k",
    comments: "8",
    commentsList: [
      {
        id: "c6",
        user: "tom",
        text: "Nhìn yên bình ghê",
        likes: 4,
        replies: [{ user: "mary_jane", text: "Đúng vậy, rất yên bình" }],
      },
      { id: "c7", user: "jane", text: "Thích kiểu cổ kính thế này", likes: 2 },
      { id: "c8", user: "kate", text: "Cổ kính quá", likes: 1 },
      { id: "c9", user: "bob", text: "Đêm đẹp quá", likes: 3 },
      { id: "c10", user: "lucy", text: "Nhiều đồ ăn ngon không?", likes: 0 },
    ],
    isFollowed: false,
  },
  {
    id: 4,
    user: {
      username: "alex_99",
      avatar: sunsetImage,
    },
    time: "3 giờ",
    title: "Hoàng hôn trên biển",
    images: [
      {
        src: sunsetImage,
        title: "Mặt trời lặn",
        likes: "10k",
        comments: [
          { user: "emma", text: "Hoàng hôn đẹp quá!" },
          { user: "david", text: "Màu sắc tuyệt vời" },
          { user: "oliver", text: "Đỉnh cao nhiếp ảnh" },
        ],
      },
      
    ],
    likes: "18k",
    comments: "32",
    commentsList: [
      {
        id: "c11",
        user: "emma",
        text: "Hoàng hôn đẹp quá!",
        likes: 12,
        replies: [
          { user: "alex_99", text: "Cảm ơn bạn!" },
          { user: "visitor", text: "Đồng ý, đẹp tuyệt vời" },
        ],
      },
      { id: "c12", user: "david", text: "Màu sắc tuyệt vời", likes: 8 },
      { id: "c13", user: "oliver", text: "Đỉnh cao nhiếp ảnh", likes: 6 },
      { id: "c14", user: "mia", text: "Thích biển quá", likes: 5 },
      { id: "c15", user: "jack", text: "Nhìn muốn đi biển liền", likes: 4 },
    ],
    isFollowed: true,
  },
  {
    id: 5,
    user: {
      username: "lisa_wanderlust",
      avatar: mountainImage,
    },
    time: "1 ngày",
    title: "Hành trình đến núi cao",
    images: [
      {
        src: mountainImage,
        title: "Đỉnh núi hùng vĩ",
        likes: "12k",
        comments: [
          { user: " sophia", text: "Chinh phục đỉnh núi luôn hả?" },
          { user: "ethan", text: "View đẹp quá" },
          { user: "chloe", text: "Mình cũng muốn leo núi" },
        ],
      },
    ],
    likes: "12k",
    comments: "20",
    commentsList: [
      { id: "c16", user: "sophia", text: "Chinh phục đỉnh núi luôn hả?", likes: 7 },
      { id: "c17", user: "ethan", text: "View đẹp quá", likes: 9 },
      {
        id: "c18",
        user: "chloe",
        text: "Mình cũng muốn leo núi",
        likes: 5,
        replies: [{ user: "lisa_wanderlust", text: "Đi cùng mình lần sau nhé!" }],
      },
    ],
    isFollowed: false,
  },
  {
    id: 6,
    user: {
      username: "travel_with_me",
      avatar: cafeImage,
    },
    time: "5 giờ",
    title: "Check-in quán cà phê chill",
    images: [
      {
        src: cafeImage,
        title: "Góc quán yêu thích",
        likes: "4k",
        comments: [
          { user: "zoe", text: "Quán đẹp quá" },
          { user: "liam", text: "Chỗ này ở đâu vậy?" },
        ],
      },
    ],
    likes: "8k",
    comments: "12",
    commentsList: [
      { id: "c19", user: "zoe", text: "Quán đẹp quá", likes: 3 },
      {
        id: "c20",
        user: "liam",
        text: "Chỗ này ở đâu vậy?",
        likes: 2,
        replies: [{ user: "travel_with_me", text: "Ở phố Nguyễn Huệ bạn nhé" }],
      },
      { id: "c21", user: "noah", text: "Cà phê ngon không?", likes: 1 },
      { id: "c22", user: "ava", text: "Nhìn chill thật", likes: 4 },
    ],
    isFollowed: true,
  },
  {
    id: 7,
    user: {
      username: "foodie_lover",
      avatar: foodImage,
    },
    time: "10 giờ",
    title: "Món ngon ngày cuối tuần",
    images: [
      {
        src: foodImage,
        title: "Bữa sáng thịnh soạn",
        likes: "8k",
        comments: [
          { user: "isabella", text: "Ngon quá bạn ơi" },
          { user: "mason", text: "Cho mình xin công thức" },
        ],
      },
    ],
    likes: "15k",
    comments: "22",
    commentsList: [
      { id: "c23", user: "isabella", text: "Ngon quá bạn ơi", likes: 6 },
      {
        id: "c24",
        user: "mason",
        text: "Cho mình xin công thức",
        likes: 8,
        replies: [{ user: "foodie_lover", text: "Mình sẽ gửi cho bạn sau nhé" }],
      },
      { id: "c25", user: "harper", text: "Ngọt ngào quá", likes: 3 },
      { id: "c26", user: "logan", text: "Trông hấp dẫn thật", likes: 5 },
    ],
    isFollowed: false,
  },
  {
    id: 8,
    user: {
      username: "pet_world",
      avatar: avtImage,
    },
    time: "12 giờ",
    title: "Bé cún đáng yêu của tôi",
    images: [
      {
        src: dogImage,
        title: "Chú cún nghịch ngợm",
        likes: "25k",
        comments: [
          { user: "amelia", text: "Dễ thương quá đi!" },
          { user: "james", text: "Cún cưng của bạn à?" },
          { user: "evelyn", text: "Muốn ôm nó quá" },
        ],
      },
    ],
    likes: "25k",
    comments: "40",
    commentsList: [
      { id: "c27", user: "amelia", text: "Dễ thương quá đi!", likes: 15 },
      {
        id: "c28",
        user: "james",
        text: "Cún cưng của bạn à?",
        likes: 7,
        replies: [{ user: "pet_world", text: "Đúng rồi, mình nuôi được 2 năm rồi" }],
      },
      { id: "c29", user: "evelyn", text: "Muốn ôm nó quá", likes: 9 },
    ],
    isFollowed: true,
  },
]

