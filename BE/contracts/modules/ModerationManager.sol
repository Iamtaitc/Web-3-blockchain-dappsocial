// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IModerationManager.sol";
import "../models/ReportModel.sol";
import "../libraries/PostLibrary.sol";
import "../utils/ArrayTools.sol";
import "../interfaces/IPostQuery.sol";
import "../interfaces/IPostModeration.sol";
import "../interfaces/ICommentModeration.sol";

contract ModerationManager is IModerationManager, AccessControl {
    using Counters for Counters.Counter;
    using ReportModel for ReportModel.Report;
    using ArrayTools for uint256[];

    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    Counters.Counter private _reportIdCounter;

    mapping(uint256 => ReportModel.Report) public reports;

    uint256[] public reportedPosts;
    uint256[] public featuredPosts;

    mapping(uint256 => PostLibrary.Post) private _postsReference;
    uint256 private _postIdCounter;

    IPostQuery public _postQuery;
    IPostModeration public _postModeration;

    address private _commentManager;
    address public postManagerAddress;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setReferences(
        address _postQueryAddress,
        address _postModerationAddress,
        address _commentManagerAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _postQuery = IPostQuery(_postQueryAddress);
        _postModeration = IPostModeration(_postModerationAddress);
        _commentManager = _commentManagerAddress;
    }

    function reportContent(
        uint256 _targetId,
        bool _isPost,
        string memory _reason
    ) public override returns (uint256) {
        if (_isPost) {
            require(_postQuery.postExists(_targetId), "Post does not exist");
        } else {
            require(_targetId > 0, "Invalid comment ID");
        }

        _reportIdCounter.increment();
        uint256 newReportId = _reportIdCounter.current();

        ReportModel.Report storage newReport = reports[newReportId];
        newReport.initialize(
            newReportId,
            _targetId,
            _isPost,
            msg.sender,
            _reason
        );

        emit ContentReported(newReportId, _targetId, _isPost, msg.sender);
        return newReportId;
    }

    function resolveReport(
        uint256 _reportId,
        ReportModel.ReportStatus _status
    ) public override {
        require(
            hasRole(MODERATOR_ROLE, msg.sender),
            "Report can only be resolved by a moderator"
        );
        require(
            _reportId > 0 && _reportId <= _reportIdCounter.current(),
            "Invalid report ID"
        );

        ReportModel.Report storage report = reports[_reportId];
        require(
            report.status == ReportModel.ReportStatus.Pending,
            "Report is already resolved"
        );

        report.status = _status;

        if (_status == ReportModel.ReportStatus.Approved) {
            if (report.isPost) {
                _postModeration.changePostStatus(
                    report.postId,
                    PostLibrary.PostStatus.Archived
                );
            } else {
                ICommentModeration(_commentManager).archiveComment(
                    report.postId
                );
            }
        }
        emit ReportResolved(_reportId, _status);
    }

    function addModerator(address _moderatorr) public override {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only admin can add moderator"
        );
        grantRole(MODERATOR_ROLE, _moderatorr);
    }

    function removeModerator(address _moderator) public override {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only admin can remove moderator"
        );
        revokeRole(MODERATOR_ROLE, _moderator);
    }

    function featurePost(uint _postId, bool _featured) public override {
        require(
            hasRole(MODERATOR_ROLE, msg.sender) ||
                hasRole(MODERATOR_ROLE, msg.sender),
            "Not authorized"
        );
        require(_postQuery.postExists(_postId), "Post does not exist");

        if (_featured) {
            if (!featuredPosts.contains(_postId)) {
                featuredPosts.push(_postId);
            }
        } else {
            featuredPosts.removeValue(_postId);
        }
        _postModeration.setPostFeatured(_postId, _featured);
    }

    function getFeaturedPosts() external view returns (uint256[] memory) {
        return featuredPosts;
    }

    function getReportDetails(
        uint256 _reportId
    )
        external
        view
        returns (
            uint256 id,
            uint256 postId,
            bool isPost,
            address reporter,
            string memory reason,
            uint256 timestamp,
            ReportModel.ReportStatus status
        )
    {
        require(
            _reportId <= _reportIdCounter.current(),
            "Report does not exist"
        );
        ReportModel.Report storage report = reports[_reportId];
        return (
            report.id,
            report.postId,
            report.isPost,
            report.reporter,
            report.reason,
            report.timestamp,
            report.status
        );
    }

    function getPendingReport() external view returns (uint256[] memory) {
        uint256 pendingCount = 0;

        for (uint256 i = 1; i < _reportIdCounter.current(); i++) {
            if (reports[i].status == ReportModel.ReportStatus.Pending) {
                pendingCount++;
            }
        }
        uint256[] memory pendingReports = new uint256[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 1; i < _reportIdCounter.current(); i++) {
            if (reports[i].status == ReportModel.ReportStatus.Pending) {
                pendingReports[index] = i;
                index++;
            }
        }
        return pendingReports;
    }

    function setPostManagerAddress(address _postManagerAddress) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        postManagerAddress = _postManagerAddress;
    }

    function contains(
        uint256[] storage array,
        uint256 value
    ) internal view returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }
}
