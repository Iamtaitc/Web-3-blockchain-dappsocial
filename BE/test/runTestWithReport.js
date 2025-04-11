const { execSync } = require('child_process');
const path = require('path');

/**
 * Script chạy test và tạo báo cáo
 */
function runTestWithReport() {
  console.log('🚀 Bắt đầu chạy test và tạo báo cáo...');
  
  try {
    // Tạo lệnh chạy test
    const testCommand = process.argv[2] || 'test'; // Cho phép truyền vào lệnh test cụ thể
    
    // Thực thi lệnh test
    execSync(`npx jest ${testCommand}`, { 
      stdio: 'inherit' // Hiển thị output trực tiếp
    });
    
    console.log('\n✅ Test và báo cáo đã hoàn thành!');
    console.log('📊 Báo cáo đã được lưu trong thư mục ../../test/docs');
  } catch (error) {
    // Ngay cả khi test thất bại, báo cáo vẫn sẽ được tạo bởi reporter
    console.log('\n❌ Một số test đã thất bại, nhưng báo cáo vẫn đã được tạo.');
    console.log('📊 Báo cáo đã được lưu trong thư mục ../../test/docs');
    
    // Đảm bảo process thoát với mã lỗi
    process.exit(1);
  }
}

runTestWithReport();