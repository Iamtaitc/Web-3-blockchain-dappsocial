const CommentSkeleton = () => {
    return (
      <div className="comment skeleton-comment">
        <div className="comment-avatar">
          <div className="skeleton-avatar"></div>
        </div>
        <div className="comment-content">
          <div className="comment-header">
            <div className="skeleton-username"></div>
            <div className="skeleton-time"></div>
          </div>
          <div className="skeleton-text"></div>
          <div className="skeleton-actions"></div>
        </div>
      </div>
    )
  }
  
  export default CommentSkeleton
  