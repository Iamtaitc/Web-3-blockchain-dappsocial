const fs = require('fs-extra');
const xml2js = require('xml2js');
const path = require('path');

async function generateMarkdownReport() {
  const xmlPath = path.join(__dirname, 'test/docs/junit.xml');
  const logPath = path.join(__dirname, 'test/docs/test-details.log');
  const mdPath = path.join(__dirname, 'test/docs/report.md');

  try {
    // Đọc file JUnit XML và parse thành JSON
    const xml = await fs.readFile(xmlPath, 'utf-8');
    const parser = new xml2js.Parser();
    const xmlData = await parser.parseStringPromise(xml);

    // Đọc file log chứa thông tin chi tiết (giả định định dạng JSON)
    const logData = JSON.parse(await fs.readFile(logPath, 'utf-8'));

    let mdContent = '# Báo Cáo Kiểm Thử Chi Tiết\n\n';
    mdContent += 'Báo cáo được tạo tự động sau khi chạy `npx jest --config=src/configs/jest.config.js`\n\n';

    mdContent += '## Tổng Quan\n';
    mdContent += '| Thuộc Tính        | Giá Trị          |\n';
    mdContent += '|-------------------|------------------|\n';
    mdContent += `| Tổng số test      | ${xmlData.testsuites.$.tests} |\n`;
    mdContent += `| Số test thất bại  | ${xmlData.testsuites.$.failures} |\n`;
    mdContent += `| Thời gian tổng    | ${xmlData.testsuites.$.time} giây |\n\n`;

    // Duyệt qua từng test suite
    xmlData.testsuites.testsuite.forEach((suite, suiteIndex) => {
      mdContent += `## Test Suite: ${suite.$.name}\n\n`;
      mdContent += `- **Số test:** ${suite.$.tests}\n`;
      mdContent += `- **Số thất bại:** ${suite.$.failures}\n`;
      mdContent += `- **Thời gian:** ${suite.$.time} giây\n\n`;

      if (suite.testcase && suite.testcase.length > 0) {
        mdContent += '### Danh Sách Test Case\n\n';
        mdContent += '| Tên Test Case         | Trạng Thái | Thời Gian | Đầu Vào | Đầu Ra | Kết Quả Mong Muốn | Kết Quả Thực Tế |\n';
        mdContent += '|-----------------------|------------|-----------|---------|--------|-------------------|-----------------|\n';

        suite.testcase.forEach((test, testIndex) => {
          const testLog = logData[suiteIndex]?.testCases[testIndex] || {};
          const status = test.failure ? '❌ Failed' : '✅ Passed';
          const input = testLog.input || 'N/A';
          const output = testLog.output || 'N/A';
          const expected = testLog.expected || 'N/A';
          const actual = testLog.actual || 'N/A';

          mdContent += `| ${test.$.name} | ${status} | ${test.$.time} giây | ${input} | ${output} | ${expected} | ${actual} |\n`;

          if (test.failure) {
            mdContent += `\n#### Chi Tiết Lỗi: ${test.$.name}\n`;
            mdContent += `- **Thông điệp lỗi:** ${test.failure[0].$.message}\n`;
            mdContent += `- **Stack Trace:**\n`;
            mdContent += '  ```\n';
            mdContent += `  ${test.failure[0]._.trim()}\n`;
            mdContent += '  ```\n\n';
          }
        });
      }
    });

    // Ghi file báo cáo
    await fs.writeFile(mdPath, mdContent);
    console.log('Báo cáo Markdown đã được tạo tại:', mdPath);
  } catch (error) {
    console.error('Lỗi khi tạo báo cáo Markdown:', error);
  }
}

generateMarkdownReport();