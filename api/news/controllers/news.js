const express = require("express");
const router = express.Router();
const func = require("../function/news");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/").get(async (req, res) => {
  try {
    const response = await func.getNews();
    if (response.status_code === "200") {
      let news = response.data;

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = 9; // Limit per page
      const skip = (page - 1) * limit;
      const totalNews = news.length;
      const totalPages = Math.ceil(totalNews / limit);

      // Paginate News
      const paginatedNews = news.slice(skip, skip + limit);

      res.render("newsAdmin", { 
        news: paginatedNews, 
        totalPages, 
        currentPage: page 
      });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/tchr").get(async (req, res) => {
  try {
    const response = await func.getNews();
    if (response.status_code === "200") {
      const news = response.data;
      res.render("newsTchr", { news });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/std").get(async (req, res) => {
  try {
    const response = await func.getNews();
    if (response.status_code === "200") {
      const news = response.data;
      res.render("newsStd", { news });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/createNews").get(async (req, res) => {
  res.render("createNews");
});

// controller
router.route("/createNews").post(upload.single("image"), async (req, res) => {
  try {
    const response = await func.createNews(req.body, req.file);
    // Send a JSON response indicating success
    res.status(200).json({ status_code: 200, message: 'News created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", newsId);
      return res.status(400).json({ error: "Invalid news ID" });
    }

    const editNews = await func.getNewsById({ id: newsId });

    if (editNews.status_code === "200") {
      res.render("editNews", { editNews: editNews.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").post(upload.single("newImage"), async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid news Id:", newsId);
      return res.status(400).json({ error: "Invalid news Id" });
    }

    let newImage = null;
    if (req.file) {
      newImage = req.file.buffer.toString("base64");
    }

    const newContent = req.body.newContent
    const newtitleName = req.body.newtitleName;
    const newdate = req.body.newdate;
    const updateResult = await func.updateNewsImage({
      id: newsId,
      newImage,
      newdate,
      newtitleName,
      newContent
    });

    if (updateResult.status_code === "200") {
      res.redirect('/news');
    } else {
      res.status(404).json({ error: updateResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.route("/delete/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", lessonId);
      return res.status(400).json({ error: "Invalid News ID" });
    }

    const softDeleteResult = await func.softDelete({ id: newsId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/news');
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/viewNews/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", newsId);
      return res.status(400).json({ error: "Invalid news ID" });
    }

    const news = await func.getNewsById({ id: newsId });

    if (news.status_code === "200") {
      res.render("viewNews", { news: news.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/stdViewNews/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", newsId);
      return res.status(400).json({ error: "Invalid news ID" });
    }

    const news = await func.getNewsById({ id: newsId });

    if (news.status_code === "200") {
      res.render("stdViewNews", { news: news.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/stdViewNews/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", newsId);
      return res.status(400).json({ error: "Invalid news ID" });
    }

    const news = await func.getNewsById({ id: newsId });

    if (news.status_code === "200") {
      res.render("stdViewNews", { news: news.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.route("/tchrViewNews/:id").get(async (req, res) => {
  try {
    const newsId = req.params.id;
    if (!newsId) {
      console.error("Invalid News ID:", newsId);
      return res.status(400).json({ error: "Invalid news ID" });
    }
    const news = await func.getNewsById({ id: newsId });

    if (news.status_code === "200") {
      res.render("tchrViewNews", { news: news.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;