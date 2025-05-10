"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/card";
import { MessageCircle, Flag, RefreshCw } from "lucide-react";
import HeartButton from "../UI/HeartButton";
import BookmarkButton from "../UI/BookmarkButton";
import NFTButton from "../NFT/UI/NFTButton";
import CommentSection from "../Comment/CommentSection";
import IPFSImage from "../UI/IPFSImage";
import { toast } from "react-hot-toast";
import avtImage from "../../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import postApi, { type Post, type PostMention } from "../../services/post.api";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "../infinite-scroll";
import { WalletLoginModal } from "../Login/wallet-login-modal";

interface UserPostsProps {
  address: string;
}

export default function UserPosts({ address }: UserPostsProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const [walletLoginModalOpen, setWalletLoginModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  const fetchUserPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (replace) {
        setIsLoading(true);
      }

      const response = await postApi.getPostsByUser(address, pageNum);
      console.log("API Response:", response);

      if (!response || typeof response !== "object") {
        throw new Error("Invalid API response");
      }

      const { success, data } = response;

      if (success && data) {
        let newPosts: Post[] = Array.isArray(data) ? data : [data];
        newPosts = newPosts.filter(
          (post): post is Post => post && typeof post === "object" && "_id" in post
        );

        if (replace) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMorePosts(newPosts.length >= 10);
      } else {
        if (replace) {
          setPosts([]);
        }
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [address]);

  useEffect(() => {
    setPage(1);
    fetchUserPosts(1, true);
  }, [address, fetchUserPosts]);

  const loadMorePosts = async (): Promise<boolean> => {
    if (!hasMorePosts || isLoading) return false;

    try {
      const nextPage = page + 1;
      await fetchUserPosts(nextPage, false);
      setPage(nextPage);
      return true;
    } catch (error) {
      console.error("Error loading more posts:", error);
      return false;
    }
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPage(1);
    fetchUserPosts(1, true);
  };

  const handleMentionClick = (mention: PostMention | string) => {
    const walletAddress = typeof mention === "string" ? mention : mention.walletAddress;
    navigate(`/user/${walletAddress}`);
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please log in to like a post");
      setWalletLoginModalOpen(true);
      return;
    }

    try {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );

      if (!isLiked) {
        await postApi.likePost(postId);
      } else {
        await postApi.unlikePost(postId);
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      toast.error("An error occurred. Please try again.");
      fetchUserPosts(page, true);
    }
  };

  const handleSavePost = async (postId: string, isSaved: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save a post");
      setWalletLoginModalOpen(true);
      return;
    }

    try {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isSaved: !post.isSaved,
                saveCount: post.isSaved ? post.saveCount - 1 : post.saveCount + 1,
              }
            : post
        )
      );

      if (!isSaved) {
        await postApi.savePost(postId);
      } else {
        await postApi.unsavePost(postId);
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      toast.error("An error occurred. Please try again.");
      fetchUserPosts(page, true);
    }
  };

  const handleReportPost = (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to report a post");
      setWalletLoginModalOpen(true);
      return;
    }

    if (confirm("Are you sure you want to report this post?")) {
      toast.success("Thank you for reporting. We will review this post.");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US");
  };

  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={`${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 w-full bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <MessageCircle className="mb-2 h-12 w-12 text-muted-foreground" />
          <CardTitle className="mb-2">No posts yet</CardTitle>
          <CardDescription>This user hasn't posted anything yet.</CardDescription>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <Card key={post._id} className="post overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start">
                  <img
                    src={
                      post.authorDetails?.avatarURI ||
                      avtImage ||
                      "/placeholder.svg?height=42&width=42"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">
                      {post.authorDetails?.username || "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <BookmarkButton
                      initialSaved={post.isSaved ?? false}
                      saveCount={post.saveCount ?? 0}
                      postId={post._id}
                      onToggle={() => handleSavePost(post._id, post.isSaved ?? false)}
                    />
                    <button
                      onClick={() => handleReportPost(post._id)}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title="Report post"
                    >
                      <Flag size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-2">
                {post.content && <p className="mb-3">{post.content}</p>}

                {(post.tags?.length > 0 || post.mentions?.length > 0) && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {post.tags?.length > 0 &&
                      post.tags.map((tag, index) => (
                        <span
                          key={`tag-${index}`}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}

                    {post.mentions?.length > 0 &&
                      post.mentions.map((mention, index) => (
                        <button
                          key={`mention-${index}`}
                          onClick={() => handleMentionClick(mention)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                        >
                          @{typeof mention === "string" ? mention : mention.username || mention.walletAddress}
                        </button>
                      ))}
                  </div>
                )}

                {post.media?.length > 0 && (
                  <div
                    className={`grid gap-2 mt-3 ${
                      post.media.length === 1
                        ? "grid-cols-1"
                        : post.media.length === 2
                        ? "grid-cols-2"
                        : post.media.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-2"
                    }`}
                  >
                    {post.media.map((media, index) => (
                      <div
                        key={index}
                        className={`${
                          post.media.length > 2 ? "max-h-48" : "max-h-96"
                        } overflow-hidden rounded-lg`}
                      >
                        <IPFSImage
                          hash={media.uri}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {!post.media?.length && post.contentURI && (
                  <div className="mt-3 max-h-96 overflow-hidden rounded-lg">
                    <IPFSImage
                      hash={post.contentURI}
                      alt="Post image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <HeartButton
                      initialLiked={post.isLiked ?? false}
                      likeCount={post.likeCount ?? 0}
                      postId={post._id}
                      onToggle={() => handleLikePost(post._id, post.isLiked ?? false)}
                    />
                    <button
                      className="flex items-center gap-1.5"
                      onClick={() => handleCommentClick(post._id)}
                    >
                      <MessageCircle size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-500">{post.commentCount ?? 0}</span>
                    </button>
                  </div>
                  <div>
                    <NFTButton
                      postId={post._id}
                      hasMedia={!!(post.media && post.media.length > 0)}
                      onNFTCreated={handleRefresh}
                    />
                    {post.nfts?.some((nft: { forSale: any }) => nft.forSale) && (
                      <button
                        onClick={() => navigate(`/marketplace?postId=${post._id}`)}
                        className="ml-2 px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                      >
                        BUY NFT
                      </button>
                    )}
                  </div>
                </div>

                {activeCommentPostId === post._id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <CommentSection
                      postId={post._id}
                      isOpen={true}
                      onClose={() => setActiveCommentPostId(null)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <InfiniteScroll onLoadMore={loadMorePosts} hasMoreData={hasMorePosts} />
        </>
      )}

      {walletLoginModalOpen && (
        <WalletLoginModal
          isOpen={walletLoginModalOpen}
          onClose={() => setWalletLoginModalOpen(false)}
        />
      )}
    </div>
  );
}
