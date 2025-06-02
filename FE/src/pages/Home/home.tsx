"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/home.css";
import "../../styles/comment-section.css";
import "../../styles/sticky-panel.css";
import Nfttuimu from "../../assets/NFTtuimu.avif";
import HeartButton from "../../components/UI/HeartButton";
import CreatePostModal from "../../components/UI/CreatePostModal";
import { Flag, PlusCircle, RefreshCw, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "../../components/infinite-scroll";
import PostSkeleton from "../../components/post-skeleton";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import postApi, { type Post, type PostMention } from "../../services/post.api";
import IPFSImage from "../../components/UI/IPFSImage";
import BookmarkButton from "../../components/UI/BookmarkButton";
import { toast } from "react-hot-toast";
import { WalletLoginModal } from "../../components/Login/wallet-login-modal";
import CommentSection from "../../components/Comment/CommentSection";
import NFTButton from "../../components/NFT/UI/NFTButton";
import PostAvatarFallback from "../../components/UI/post-avatar-fallback";
import { hasPostImages } from "../../lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/profile/ui/avatar";
import nftApi from "../../services/nft.api";

const Home = () => {
  const navigate = useNavigate();
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "follow">("discover");
  const [apiPosts, setApiPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const [walletLoginModalOpen, setWalletLoginModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const handleScroll = () => {
      if (!rightPanelRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const rightPanel = rightPanelRef.current;
      const rightPanelParent = rightPanel.parentElement;

      if (!rightPanelParent) return;

      const rightPanelWidth = rightPanelParent.offsetWidth;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const containerTop = containerRect.top + scrollY;
      const containerBottom = containerRect.bottom + scrollY;

      const rightPanelHeight = rightPanel.offsetHeight;

      if (scrollY > containerTop) {
        rightPanel.style.position = "fixed";
        rightPanel.style.top = "20px";
        rightPanel.style.width = `${rightPanelWidth}px`;

        const bottomLimit = containerBottom - rightPanelHeight - 20;
        if (scrollY > bottomLimit) {
          rightPanel.style.top = `${bottomLimit - scrollY + 20}px`;
        }
      } else {
        rightPanel.style.position = "static";
        rightPanel.style.width = "100%";
        rightPanel.style.top = "0";
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [apiPosts]);

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (replace) {
        setIsLoading(true);
      }

      const response = await postApi.getAllPosts(pageNum, 10);
      if (response.success && response.data) {
        let newPosts: Post[] = [];
        if (Array.isArray(response.data)) {
          newPosts = response.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          newPosts = response.data.posts;
        }

        const nftResponse = await nftApi.getAllNFTs();
        console.log("NFT Response:", nftResponse);
        const postsWithNfts = await Promise.all(newPosts.map(async (post) => {
          const postNfts = nftResponse.data.nfts.filter((nft: any) => nft.postId === post._id);
          console.log(`Post ${post._id} NFTs:`, postNfts);
          return { ...post, nfts: postNfts, author: post.author || "0x0" };
        }));

        if (replace) {
          setApiPosts(postsWithNfts);
        } else {
          setApiPosts((prev) => [...prev, ...postsWithNfts]);
        }

        setHasMorePosts(postsWithNfts.length === 10);
        if (!replace) {
          setPage(pageNum);
        }
      } else {
        if (replace) {
          setApiPosts([]);
        }
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
      toast.error("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [activeTab, fetchPosts]);

  const loadMorePosts = async (): Promise<boolean> => {
    if (!hasMorePosts || isLoading) return false;

    try {
      const nextPage = page + 1;
      await fetchPosts(nextPage, false);
      return true;
    } catch (error) {
      console.error("Lỗi khi tải thêm bài viết:", error);
      return false;
    }
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  };

  const handleTabChange = (tab: "discover" | "follow") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setApiPosts([]);
    setHasMorePosts(true);
    setIsLoading(true);
  };

  const handlePostCreated = () => {
    toast.success("Đăng bài thành công!");
    handleRefresh();
  };

  const handleMentionClick = (mention: PostMention) => {
    navigate(`/user/${mention.walletAddress}`);
  };

  const handlePostButtonClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng bài");
      setWalletLoginModalOpen(true);
    } else {
      setCreatePostModalOpen(true);
    }
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      navigate("/login");
      return;
    }

    try {
      setApiPosts((posts) =>
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.likeCount ? post.likeCount - 1 : post.likeCount + 1,
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
      console.error("Lỗi khi thích/bỏ thích bài viết:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      fetchPosts(page, true);
    }
  };

  const handleSavePost = async (postId: string, isSaved: boolean) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu bài viết");
      navigate("/login");
      return;
    }

    try {
      setApiPosts((posts) =>
        posts.map((post) =>
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
      console.error("Lỗi khi lưu/bỏ lưu bài viết:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      fetchPosts(page, true);
    }
  };

  const handleReportPost = (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để báo cáo bài viết");
      navigate("/login");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn báo cáo bài viết này không?")) {
      toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.");
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

    if (diffSecs < 60) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  return (
    <div className="container" ref={containerRef}>
      <div className="left-panel">
        <div className="tabs-container">
          <div className="discover">
            <span className={activeTab === "discover" ? "active" : ""} onClick={() => handleTabChange("discover")}>
              Khám phá
            </span>
            <span className={activeTab === "follow" ? "active" : ""} onClick={() => handleTabChange("follow")}>
              Theo dõi
            </span>

            <button onClick={handleRefresh} className="refresh-button" disabled={isRefreshing} title="Làm mới">
              <RefreshCw size={18} className={`${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="status-container">
          <div className="Status">
            <div className="tl">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.avatarURI || undefined}
                  alt={user?.username || ""}
                />
                <AvatarFallback username={user?.username || "User"} />
              </Avatar>
              <p>Có gì mới?</p>
            </div>
            <div className="bt">
              <button onClick={handlePostButtonClick} className="flex items-center gap-2 justify-center">
                <PlusCircle size={18} />
                <span>{isAuthenticated ? "Đăng Bài" : "Đăng nhập để đăng bài"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="posts-container">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : apiPosts.length > 0 ? (
            <div>
              {apiPosts.map((post) => (
                <div key={post._id} className="post">
                  <div className="user-info">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.authorDetails?.avatarURI || undefined}
                        alt={post.authorDetails?.username || ""}
                      />
                      <AvatarFallback
                        username={post.authorDetails?.username || post.author || "User"}
                      />
                    </Avatar>
                    <div className="user-details">
                      <p className="username">{post.authorDetails?.username}</p>
                      <p className="time">{formatTime(post.createdAt)}</p>
                    </div>

                    <div className="flex items-center ml-auto gap-3">
                      <BookmarkButton
                        initialSaved={post.isSaved || false}
                        saveCount={post.saveCount}
                        postId={post._id}
                        onToggle={() => handleSavePost(post._id, post.isSaved || false)}
                      />
                      <button
                        onClick={() => handleReportPost(post._id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        title="Báo cáo bài viết"
                      >
                        <Flag size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {post.content && <p className="post-title">{post.content}</p>}

                  {(post.tags?.length > 0 || post.mentions?.length > 0) && (
                    <div className="flex flex-wrap gap-2 my-2">
                      {post.tags &&
                        post.tags.length > 0 &&
                        post.tags.map((tag, index) => (
                          <span
                            key={`tag-${index}`}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}

                      {post.mentions &&
                        post.mentions.length > 0 &&
                        post.mentions.map((mention, index) => (
                          <button
                            key={`mention-${index}`}
                            onClick={() => handleMentionClick(mention)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                          >
                            @{mention.username}
                          </button>
                        ))}
                    </div>
                  )}

                  {hasPostImages(post) ? (
                    <>
                      {post.media && post.media.length > 0 && (
                        <div
                          className={`image-container ${
                            post.media.length === 2
                              ? "two"
                              : post.media.length === 3
                                ? "three"
                                : post.media.length === 4
                                  ? "four"
                                  : ""
                          }`}
                        >
                          {post.media.map((media, index) => (
                            <IPFSImage
                              key={index}
                              hash={media.uri}
                              alt={`Hình ảnh bài viết ${index + 1}`}
                              className="post-image"
                            />
                          ))}
                        </div>
                      )}

                      {(!post.media || post.media.length === 0) && post.contentURI && (
                        <div className="image-container">
                          <IPFSImage hash={post.contentURI} alt="Hình ảnh bài viết" className="post-image" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="avatar-fallback-container">
                      <PostAvatarFallback
                        avatarURI={post.authorDetails?.avatarURI}
                        username={post.authorDetails?.username}
                      />
                    </div>
                  )}

                  <div className="actions">
                    <div className="icon-page">
                      <span className="like">
                        <HeartButton
                          initialLiked={post.isLiked || false}
                          likeCount={post.likeCount}
                          postId={post._id}
                          onToggle={() => handleLikePost(post._id, post.isLiked || false)}
                        />
                      </span>
                      <span className="comment" onClick={() => handleCommentClick(post._id)}>
                        <MessageCircle className="comment-icon" />
                        <span className="count">{post.commentCount}</span>
                      </span>
                    </div>
                    <div className="nft-bt">
                      <NFTButton
                        postId={post._id}
                        hasMedia={hasPostImages(post)}
                        onNFTCreated={handleRefresh}
                        nfts={post.nfts}
                        authorId={post.author}
                      />
                    </div>
                  </div>

                  {activeCommentPostId === post._id && (
                    <CommentSection postId={post._id} isOpen={true} onClose={() => setActiveCommentPostId(null)} />
                  )}
                </div>
              ))}

              <InfiniteScroll onLoadMore={loadMorePosts} hasMoreData={hasMorePosts} />
            </div>
          ) : (
            <div className="empty-follow-state">
              <div className="empty-follow-content">
                <img
                  src={PostAvatarFallback || "/placeholder.svg?height=120&width=120"}
                  alt="Trạng thái trống"
                  className="empty-follow-image"
                />
                <h3>Chưa có bài viết nào</h3>
                <p>
                  {activeTab === "follow"
                    ? "Hãy theo dõi những người dùng khác để xem bài viết của họ ở đây"
                    : "Chưa có bài viết nào trong hệ thống"}
                </p>
                {activeTab === "follow" && (
                  <button className="discover-more-btn" onClick={() => handleTabChange("discover")}>
                    Khám phá thêm
                  </button>
                )}
                {activeTab === "discover" && isAuthenticated && (
                  <button className="discover-more-btn" onClick={() => setCreatePostModalOpen(true)}>
                    Tạo bài viết đầu tiên
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="right-panel-container">
        <div className="right-panel" ref={rightPanelRef}>
          <div className="balance">
            <p className="balance-amount">189.331.433 Dx</p>
            <div className="balance-checkin">
              <p className="checkin">Điểm danh</p>
              <p className="day14">Ngày 14</p>
              <button className="claim-checkin">Nhận</button>
            </div>
            <p className="farming">🌱 Farming 400 Dx/h</p>
            <button className="claim-farming">Nhận</button>
          </div>

          <div className="referrals">
            <h3>Giới thiệu</h3>
            <p>Giới thiệu người dùng với mã giới thiệu của bạn để kiếm điểm.</p>
            <p className="total-referrals">
              Tổng: <span>3</span>
            </p>
            <button className="invite">Mời bạn bè</button>
          </div>

          <div className="nft-ad-card">
            <h3>🎁 Bốc Túi Mù NFT</h3>
            <p>Mở túi và nhận NFT hiếm!</p>
            <img src={Nfttuimu || "/placeholder.svg?height=80&width=80"} alt="Túi mù NFT" />
            <button className="explore-btn">Khám phá ngay</button>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {walletLoginModalOpen && (
        <WalletLoginModal isOpen={walletLoginModalOpen} onClose={() => setWalletLoginModalOpen(false)} />
      )}
    </div>
  );
};

export default Home;