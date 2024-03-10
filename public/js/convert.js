// ข้อมูล HTML ที่ได้จากฐานข้อมูล
const htmlContent = '<%= lesson.content %>';

// ใช้ innerHTML เพื่อแปลง HTML ให้เป็น Element
const div = document.createElement('div');
div.innerHTML = htmlContent;

// เพิ่ม Element ที่มี HTML เข้าไปใน DOM
document.getElementById('data-container').appendChild(div);
