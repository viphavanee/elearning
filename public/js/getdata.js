$(document).ready(function(){
	$("#createLessonForm").submit(function(e){
		var content = tinymce.get("my-expressjs-tinymce-app").getContent();
    
		$.ajax({
			url: "/createLesson",
			type: "POST",
			data: {
				content: content
			},
			success: function(response) {
				console.log("Lesson created successfully");
				window.location.href = '/lesson';
			},
			error: function(xhr, status, error) {
				console.error("Error creating lesson:", error);
			}
		});
		return false;
	});
});
