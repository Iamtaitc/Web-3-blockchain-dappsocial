// test/utils/testReporter.js
const fs = require('fs');
const path = require('path');

/**
 * Reporter tùy chỉnh cho Jest để tạo báo cáo sau khi chạy test
 * @param {Object} globalConfig - Cấu hình toàn cục của Jest
 * @param {Object} options - Các tùy chọn cho reporter
 */
class TestReporter {
  constructor(globalConfig, options = {}) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.testResults = {
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      testSuites: [],
      failedTests: [],
      startTime: new Date(),
      endTime: null
    };
  }

  /**
   * Được gọi khi bắt đầu toàn bộ quá trình test
   */
  onRunStart(results, options) {
    this.testResults.startTime = new Date();
    console.log("\n🚀 Bắt đầu chạy test...");
  }

  /**
   * Được gọi khi một test suite hoàn thành
   */
  onTestResult(test, testResult, aggregatedResult) {
    const suiteName = testResult.testResults[0]?.ancestorTitles[0] || 'Unknown Suite';
    
    const suiteResult = {
      name: suiteName,
      numTests: testResult.numPassingTests + testResult.numFailingTests,
      numPassedTests: testResult.numPassingTests,
      numFailedTests: testResult.numFailingTests,
      tests: []
    };

    // Thêm kết quả chi tiết của từng test
    testResult.testResults.forEach(result => {
      const testInfo = {
        name: result.title,
        status: result.status,
        ancestorTitles: result.ancestorTitles,
        failureMessages: result.failureMessages
      };
      
      suiteResult.tests.push(testInfo);
      
      // Thu thập thông tin về các test thất bại
      if (result.status === 'failed') {
        this.testResults.failedTests.push({
          suiteName,
          testName: result.title,
          failureMessages: result.failureMessages
        });
      }
    });

    this.testResults.testSuites.push(suiteResult);
    this.testResults.numTotalTests += suiteResult.numTests;
    this.testResults.numPassedTests += suiteResult.numPassedTests;
    this.testResults.numFailedTests += suiteResult.numFailedTests;
  }

  /**
   * Được gọi khi toàn bộ quá trình test kết thúc
   */
  onRunComplete(contexts, results) {
    this.testResults.endTime = new Date();
    
    const executionTime = (this.testResults.endTime - this.testResults.startTime) / 1000;
    
    // Tạo nội dung báo cáo
    let reportContent = this._generateReport(executionTime);
    
    try {
      // Sử dụng đường dẫn tương đối tới thư mục gốc của dự án
      const reportDir = path.resolve(__dirname, '../../test/docs');
      
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Tạo tên file báo cáo với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const reportFile = path.join(reportDir, `test-report-${timestamp}.txt`);
      
      // Lưu báo cáo vào file
      fs.writeFileSync(reportFile, reportContent);
      
      console.log(`\n✅ Báo cáo test đã được lưu tại: ${reportFile}`);
    } catch (error) {
      console.error('\n❌ Lỗi khi lưu báo cáo test:', error.message);
      console.log('Nội dung báo cáo:', reportContent);
    }
  }

  /**
   * Tạo nội dung báo cáo
   */
  _generateReport(executionTime) {
    const passRate = this.testResults.numTotalTests > 0 
      ? (this.testResults.numPassedTests / this.testResults.numTotalTests * 100).toFixed(2)
      : '0.00';
    
    let report = `BÁO CÁO KẾT QUẢ TEST\n`;
    report += `==========================================\n\n`;
    report += `Thời gian thực hiện: ${this.testResults.startTime.toLocaleString()}\n`;
    report += `Thời gian hoàn thành: ${this.testResults.endTime.toLocaleString()}\n`;
    report += `Tổng thời gian chạy: ${executionTime.toFixed(2)} giây\n\n`;
    
    report += `TỔNG QUAN\n`;
    report += `------------------------------------------\n`;
    report += `Tổng số test: ${this.testResults.numTotalTests}\n`;
    report += `Số test thành công: ${this.testResults.numPassedTests}\n`;
    report += `Số test thất bại: ${this.testResults.numFailedTests}\n`;
    report += `Tỷ lệ thành công: ${passRate}%\n\n`;
    
    report += `CHI TIẾT TEST SUITE\n`;
    report += `------------------------------------------\n`;
    this.testResults.testSuites.forEach(suite => {
      report += `\n[${suite.name}]\n`;
      report += `  Tổng số test: ${suite.numTests}\n`;
      report += `  Thành công: ${suite.numPassedTests}\n`;
      report += `  Thất bại: ${suite.numFailedTests}\n\n`;
      
      report += `  Danh sách test:\n`;
      suite.tests.forEach(test => {
        const prefix = test.status === 'passed' ? '✓' : '✗';
        const ancestorPath = test.ancestorTitles.slice(1).join(' > ');
        const displayPath = ancestorPath ? `${ancestorPath} > ` : '';
        report += `  ${prefix} ${displayPath}${test.name}\n`;
      });
      report += '\n';
    });
    
    if (this.testResults.failedTests.length > 0) {
      report += `CHI TIẾT CÁC TEST THẤT BẠI\n`;
      report += `------------------------------------------\n`;
      this.testResults.failedTests.forEach((test, index) => {
        report += `\n${index + 1}. [${test.suiteName}] ${test.testName}\n`;
        test.failureMessages.forEach(message => {
          // Làm sạch thông báo lỗi để dễ đọc hơn
          const cleanMessage = message
            .replace(/\u001b\[\d+m/g, '') // Loại bỏ mã màu ANSI
            .split('\n')
            .filter(line => !line.includes('node_modules')) // Loại bỏ các dòng liên quan đến node_modules
            .join('\n');
            
          report += `   ${cleanMessage}\n`;
        });
      });
    }
    
    report += `\n==========================================\n`;
    report += `Báo cáo được tạo bởi TestReporter\n`;
    
    return report;
  }
}

module.exports = TestReporter;