const { MongoClient, ObjectId } = require("mongodb");

const createNotification = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("notification");

    let title;
    let content;

    const themeId = data.themeId;
    const commentId = data.commentId;
    const reportType = data.reportType;
    const userId = data.userId;
    const createType = data.createType;
    if (createType === "report") {
      if (reportType) {
        if (reportType === "theme") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #FFD43B;"></i> กระทู้ถูกรายงาน`;
          if (data.reason === "อื่นๆ") {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}, ${data.other}`
          } else {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}`
          }
        } else if (reportType === "comment") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #FFD43B;"></i> คอมเมนท์ถูกรายงาน`
          if (data.reason === "อื่นๆ") {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}, ${data.other}`
          } else {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}`
          }
        } else if (reportType === "reply") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #FFD43B;"></i> การตอบกลับถูกรายงาน`
          if (data.reason === "อื่นๆ") {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}, ${data.other}`
          } else {
            content = `เนื้อหาของคุณถูกรายงานด้วยสาเหตุ ${data.reason}`
          }
        }
      } else {
        console.error(`${reportType} is undifined`)
      }
    } else if (createType === "delete") {
      if (reportType) {
        if (reportType === "theme") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #ff3d3d;"></i> กระทู้ถูกลบ`;

          content = `เนื้อหาของคุณถูกลบเพราะถูกรายงานหลายครั้ง`
        } else if (reportType === "comment") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #ff3d3d;"></i> คอมเมนท์ถูกลบ`
          content = `เนื้อหาของคุณถูกลบเพราะถูกรายงานหลายครั้ง`
        } else if (reportType === "reply") {
          title = `<i class="fa-solid fa-triangle-exclamation mr-2" style="color: #ff3d3d;"></i> การตอบกลับถูกลบ`
          content = `เนื้อหาของคุณถูกลบเพราะถูกรายงานหลายครั้ง`
        }
      } else {
        console.error(`${reportType} is undifined`)
      }
    } else if (createType === "reply") {
      if (reportType) {
        if (reportType === "reply") {
          title = `<i class="fa-solid fa-reply mr-2" style="color: blue;"></i> มีการตอบกลับคอมเมนท์ของคุณ`
          content = ` `
        }
      } else {
        console.error(`${reportType} is undifined`)
      }
    }



    const create_at = new Date();
    await collection.insertOne({
      title,
      content,
      reportType,
      userId,
      themeId,
      commentId,
      create_at
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create news notification`,
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getNotificationByUserId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("notification");

    const userId = data.userId;
    // Fetch notifications, order by created_at descending
    const result = await collection
      .find({ userId })
      .sort({ create_at: -1 })  // Sort by created_at in descending order
      .toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `Notifications fetched successfully`,
      data: result,
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: "Error occurred while fetching notifications",
    };
  }
};

const readAllNotify = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("notification");

    const userId = data.userId;

    await collection.updateMany(
      { userId },
      { $set: { isRead: true } }
    );

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `Notification read successfully`,
    };
  } catch (error) {
    console.error("Error reading notification:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: "Error occurred while reading notification",
    };
  }
}

module.exports = {
  createNotification,
  getNotificationByUserId,
  readAllNotify
};