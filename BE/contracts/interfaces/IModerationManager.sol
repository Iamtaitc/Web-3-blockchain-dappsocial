// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../models/ReportModel.sol";

interface IModerationManager {
    event ContentReported(
        uint256 reportId,
        uint256 targerId,
        bool isPost,
        address reporter
    );
    event ReportResolved(
        uint256 reportId,
        ReportModel.ReportStatus status
    );

    function reportContent(
        uint256 _targetId,
        bool _isPost,
        string memory _reason
    ) external returns (uint256);

    function resolveReport(
        uint256 _reportId,
        ReportModel.ReportStatus _status
    ) external;

    function addModerator(address _moderator) external;

    function removeModerator(address _moderator) external;

    function featurePost(uint256 _postI, bool _featured) external;
}