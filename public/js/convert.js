
const htmlContent = '<%= lesson.content %>';
const div = document.createElement('div');
div.innerHTML = htmlContent;
document.getElementById('data-container').appendChild(div);
