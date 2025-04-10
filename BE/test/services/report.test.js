const ReportService = require("../services/ReportService");
const { Report, Post, Comment, User, NFTCache } = require("../models/index");

// Mock the dependencies
jest.mock("../models/index");

describe("ReportService", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup common mock implementations
    Report.prototype.save = jest.fn().mockResolvedValue(true);
    Report.countDocuments = jest.fn().mockResolvedValue(0);
  });

  // PART 1: REPORT CREATION AND USER REPORTS
  describe("Part 1: Report Creation and User Reports", () => {
    describe("createReport", () => {
      test("should create a report for a valid post", async () => {
        // Setup mock data
        const postMock = { _id: "post123", author: "user456" };
        const reportMock = {
          _id: "report123",
          reporter: "reporter789",
          targetType: "post",
          targetId: "post123",
          reason: "spam",
          details: "This is spam content",
          status: "pending",
          createdAt: new Date(),
        };

        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(postMock);
        Report.findOne = jest.fn().mockResolvedValue(null); // No existing report
        Report.prototype.save = jest.fn().mockImplementation(function () {
          this._id = "report123";
          return Promise.resolve(this);
        });

        // Spy on updateReportCount method
        const updateReportCountSpy = jest
          .spyOn(ReportService, "updateReportCount")
          .mockResolvedValue();

        // Execute the create report
        const result = await ReportService.createReport(
          "post",
          "post123",
          "spam",
          "This is spam content",
          "reporter789"
        );

        // Assertions
        expect(result.success).toBe(true);
        expect(result.status).toBe(201);
        expect(result.data).toHaveProperty("reportId", "report123");
        expect(Post.findOne).toHaveBeenCalledWith({ _id: "post123" });
        expect(Report.findOne).toHaveBeenCalledWith({
          reporter: "reporter789",
          targetType: "post",
          targetId: "post123",
        });
        expect(Report.prototype.save).toHaveBeenCalled();
        expect(updateReportCountSpy).toHaveBeenCalledWith("post", "post123");
      });

      test("should not allow self-reporting", async () => {
        // Setup mock data
        const postMock = { _id: "post123", author: "user456" };

        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(postMock);

        // Execute the create report with the same address as the author
        const result = await ReportService.createReport(
          "post",
          "post123",
          "spam",
          "This is spam content",
          "user456"
        );

        // Assertions
        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe(
          "Bạn không thể báo cáo nội dung của chính mình"
        );
        expect(Report.prototype.save).not.toHaveBeenCalled();
      });

      test("should prevent duplicate reports", async () => {
        // Setup mock data
        const postMock = { _id: "post123", author: "user456" };
        const existingReportMock = {
          reporter: "reporter789",
          targetType: "post",
          targetId: "post123",
        };

        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(postMock);
        Report.findOne = jest.fn().mockResolvedValue(existingReportMock);

        // Execute the create report
        const result = await ReportService.createReport(
          "post",
          "post123",
          "spam",
          "This is spam content",
          "reporter789"
        );

        // Assertions
        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Bạn đã báo cáo nội dung này rồi");
        expect(Report.prototype.save).not.toHaveBeenCalled();
      });

      test("should handle non-existent targets", async () => {
        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(null);

        // Execute the create report
        const result = await ReportService.createReport(
          "post",
          "nonexistent",
          "spam",
          "This is spam content",
          "reporter789"
        );

        // Assertions
        expect(result.success).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toBe("Không tìm thấy target");
        expect(Report.prototype.save).not.toHaveBeenCalled();
      });

      test("should handle errors gracefully", async () => {
        // Setup error mock
        Post.findOne = jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        });

        // Execute the create report
        const result = await ReportService.createReport(
          "post",
          "post123",
          "spam",
          "This is spam content",
          "reporter789"
        );

        // Assertions
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi tạo báo cáo");
        expect(result.error).toBe("Database error");
      });
    });

    describe("getUserReports", () => {
      test("should get reports for a specific user with pagination", async () => {
        // Setup mock data
        const reportsMock = [
          {
            _id: "report1",
            reporter: "user123",
            targetType: "post",
            targetId: "post1",
            toObject: function () {
              return this;
            },
          },
          {
            _id: "report2",
            reporter: "user123",
            targetType: "comment",
            targetId: "comment1",
            toObject: function () {
              return this;
            },
          },
        ];

        // Setup mocks
        Report.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(reportsMock),
        });
        Report.countDocuments = jest.fn().mockResolvedValue(reportsMock.length);

        // Spy on getTargetDetails method
        const getTargetDetailsSpy = jest
          .spyOn(ReportService, "getTargetDetails")
          .mockResolvedValue({ content: "Report content" });

        // Execute the get user reports
        const result = await ReportService.getUserReports("user123", 1, 10);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toHaveProperty("reports");
        expect(result.data).toHaveProperty("pagination");
        expect(result.data.reports.length).toBe(2);
        expect(result.data.pagination).toEqual({
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
        });
        expect(Report.find).toHaveBeenCalledWith({ reporter: "user123" });
        expect(getTargetDetailsSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  // PART 2: ADMIN OPERATIONS AND REPORT HANDLING
  describe("Part 2: Admin Operations and Report Handling", () => {
    describe("getAllReports", () => {
      test("should get all reports with filters for admins", async () => {
        // Setup mock data
        const reportsMock = [
          {
            _id: "report1",
            status: "pending",
            targetType: "post",
            targetId: "post1",
            reporter: "user123",
            toObject: function () {
              return this;
            },
          },
          {
            _id: "report2",
            status: "pending",
            targetType: "comment",
            targetId: "comment1",
            reporter: "user456",
            toObject: function () {
              return this;
            },
          },
        ];

        // Setup mocks
        Report.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(reportsMock),
        });
        Report.countDocuments = jest
          .fn()
          .mockResolvedValueOnce(reportsMock.length) // For total count
          .mockResolvedValueOnce(2) // For pending count
          .mockResolvedValueOnce(1) // For resolved count
          .mockResolvedValueOnce(0); // For rejected count

        // Spy on getTargetDetails method
        const getTargetDetailsSpy = jest
          .spyOn(ReportService, "getTargetDetails")
          .mockResolvedValue({ content: "Report content" });

        // Mock user find for reporter details
        User.findOne = jest
          .fn()
          .mockResolvedValueOnce({
            username: "user1",
            walletAddress: "user123",
          })
          .mockResolvedValueOnce({
            username: "user2",
            walletAddress: "user456",
          });

        // Execute the get all reports
        const result = await ReportService.getAllReports(
          1,
          10,
          "pending",
          null
        );

        // Assertions
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toHaveProperty("reports");
        expect(result.data).toHaveProperty("counts");
        expect(result.data).toHaveProperty("pagination");
        expect(result.data.reports.length).toBe(2);
        expect(result.data.counts).toEqual({
          pending: 2,
          resolved: 1,
          rejected: 0,
        });
        expect(Report.find).toHaveBeenCalledWith({ status: "pending" });
        expect(getTargetDetailsSpy).toHaveBeenCalledTimes(2);
        expect(User.findOne).toHaveBeenCalledTimes(2);
      });
    });

    describe("updateReportStatus", () => {
      test("should update report status and execute action when resolved", async () => {
        // Setup mock data
        const reportMock = {
          _id: "report123",
          targetType: "post",
          targetId: "post123",
          status: "pending",
          save: jest.fn().mockResolvedValue(true),
        };

        // Setup mocks
        Report.findById = jest.fn().mockResolvedValue(reportMock);

        // Spy on executeModAction method
        const executeModActionSpy = jest
          .spyOn(ReportService, "executeModAction")
          .mockResolvedValue();

        // Execute the update report status
        const result = await ReportService.updateReportStatus(
          "report123",
          "resolved",
          "Violates community guidelines",
          "hide",
          "admin123"
        );

        // Assertions
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(reportMock.status).toBe("resolved");
        expect(reportMock.adminComment).toBe("Violates community guidelines");
        expect(reportMock.resolvedBy).toBe("admin123");
        expect(reportMock.save).toHaveBeenCalled();
        expect(executeModActionSpy).toHaveBeenCalledWith(
          "post",
          "post123",
          "hide",
          "admin123"
        );
      });

      test("should handle non-existent reports", async () => {
        // Setup mocks
        Report.findById = jest.fn().mockResolvedValue(null);

        // Execute the update report status
        const result = await ReportService.updateReportStatus(
          "nonexistent",
          "resolved",
          "Comment",
          "hide",
          "admin123"
        );

        // Assertions
        expect(result.success).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toBe("Không tìm thấy báo cáo");
      });
    });

    describe("getTargetDetails", () => {
      test("should get details for post targets", async () => {
        // Setup mock data
        const postMock = {
          _id: "post123",
          content:
            "This is a test post with more than 100 characters to test truncation functionality in the getTargetDetails method of our ReportService class.",
          author: "user456",
          createdAt: new Date("2023-01-01"),
        };

        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(postMock);

        // Execute the get target details
        const result = await ReportService.getTargetDetails("post", "post123");

        // Assertions
        expect(result).toEqual({
          content:
            "This is a test post with more than 100 characters to test truncation functionality in the getTargetDetails m...",
          author: "user456",
          createdAt: postMock.createdAt,
        });
      });

      test("should handle non-existent target", async () => {
        // Setup mocks
        Post.findOne = jest.fn().mockResolvedValue(null);

        // Execute the get target details
        const result = await ReportService.getTargetDetails(
          "post",
          "nonexistent"
        );

        // Assertions
        expect(result).toEqual({ notFound: true });
      });
    });

    describe("updateReportCount", () => {
      test("should update report count and auto-hide when threshold is reached", async () => {
        // Setup mocks
        Report.countDocuments = jest.fn().mockResolvedValue(5); // Equal to threshold
        Post.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

        // Spy on autoHideContent method
        const autoHideContentSpy = jest
          .spyOn(ReportService, "autoHideContent")
          .mockResolvedValue();

        // Execute the update report count
        await ReportService.updateReportCount("post", "post123");

        // Assertions
        expect(Report.countDocuments).toHaveBeenCalledWith({
          targetType: "post",
          targetId: "post123",
          status: "pending",
        });
        expect(Post.updateOne).toHaveBeenCalledWith(
          { _id: "post123" },
          { $set: { reportCount: 5 } }
        );
        expect(autoHideContentSpy).toHaveBeenCalledWith("post", "post123");
      });

      test("should not auto-hide when threshold is not reached", async () => {
        // Setup mocks
        Report.countDocuments = jest.fn().mockResolvedValue(4); // Below threshold
        Post.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

        // Spy on autoHideContent method
        const autoHideContentSpy = jest
          .spyOn(ReportService, "autoHideContent")
          .mockResolvedValue();

        // Execute the update report count
        await ReportService.updateReportCount("post", "post123");

        // Assertions
        expect(Post.updateOne).toHaveBeenCalledWith(
          { _id: "post123" },
          { $set: { reportCount: 4 } }
        );
        expect(autoHideContentSpy).not.toHaveBeenCalled();
      });
    });

    describe("executeModAction", () => {
      test("should hide a post when hide action is specified", async () => {
        // Setup mocks
        Post.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

        // Execute the execute mod action
        await ReportService.executeModAction(
          "post",
          "post123",
          "hide",
          "admin123"
        );

        // Assertions
        expect(Post.updateOne).toHaveBeenCalledWith(
          { _id: "post123" },
          {
            $set: {
              status: "hidden",
              hiddenReason: "hidden by admin",
              hiddenBy: "admin123",
              hiddenAt: expect.any(Date),
            },
          }
        );
      });

      test("should ban a user when ban action is specified", async () => {
        // Setup mocks
        User.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

        // Execute the execute mod action
        await ReportService.executeModAction(
          "user",
          "user123",
          "ban",
          "admin123"
        );

        // Assertions
        expect(User.updateOne).toHaveBeenCalledWith(
          { walletAddress: "user123" },
          {
            $set: {
              status: "suspended",
              suspendedReason: "banned by admin",
              suspendedBy: "admin123",
              suspendedAt: expect.any(Date),
            },
          }
        );
      });
    });
  });
});
