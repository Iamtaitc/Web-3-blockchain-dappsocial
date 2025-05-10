const PostSkeleton = () => {
    return (
      <div className="post animate-pulse">
        <div className="user-info">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-3/4 h-4 bg-gray-200 rounded my-3"></div>
        <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
        <div className="actions mt-3">
          <div className="icon-page">
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="nft-bt">
            <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }
  
  export default PostSkeleton
  