// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ReportModel {
    enum ReportStatus {
        Pending,
        Approved,
        Rejected
    }

    struct Report {
        uint256 id;
        uint256 postId;
        bool isPost;
        address reporter;
        string reason;
        uint256 timestamp;
        ReportStatus status;
    }

    function initialize(
        Report storage _report,
        uint256 _id,
        uint256 _postId,
        bool _isPost,
        address _reporter,
        string memory _reason
    ) internal {
        _report.id = _id;
        _report.postId = _postId;
        _report.isPost = _isPost;
        _report.reporter = _reporter;
        _report.reason = _reason;
        _report.timestamp = block.timestamp;
        _report.status = ReportStatus.Pending;
    }
}
