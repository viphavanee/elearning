const { MongoClient, ObjectId } = require("mongodb");


const createReport = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("report");
    const currentDate = new Date();
   
    await collection.insertOne({
      userId: data.userId,
      themeId: data.themeId,
      commentId: data.commentId,
      replyId: data.replyId,
      reportType: data.reportType,
      reason: data.reason,
      other: data.other,
      createDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create report success`,
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
const getReport = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("report");

    const report = await collection.find({ isDeleted: { $ne: true } }).toArray();


    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get report success`,
      data: report,
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getThemeReport = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("report");
    const themeId = data.themeId.toString();

    const report = await collection.find({ themeId, reportType: "theme", isDeleted: { $ne: true } }).toArray();


    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get report success`,
      data: report,
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getCommentReport = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("report");
    const commentId = data.commentId.toString()

    const report = await collection.find({ commentId, reportType: "comment", isDeleted: { $ne: true } }).toArray();


    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get report success`,
      data: report,
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getReplyReport = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("report");
    const replyId = data.replyId.toString()

    const report = await collection.find({ replyId, reportType: "reply", isDeleted: { $ne: true } }).toArray();


    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get report success`,
      data: report,
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getReportById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("report");
    const objectId = new ObjectId(data.id);
    const report = await collection.findOne({ _id: objectId });
    await client.close();
    if (report) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get report by id success`,
        data: report,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `report with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting report by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("report");

    const objectId = new ObjectId(data.id);
    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for report with id ${data}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `report with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting report:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
module.exports = {
  createReport,
  getReport,
  getThemeReport,
  getCommentReport,
  getReplyReport,
  getReportById,
  softDelete
};
