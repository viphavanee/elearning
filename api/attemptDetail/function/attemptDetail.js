const { MongoClient, ObjectId } = require("mongodb");

const createAttemptDetail = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attemptDetails");

    const currentDate = new Date();
    await collection.insertOne({
      attemptDetailId: data.attemptDetailId,
      questionId: data.questionId,
      attemptId: data.attemptId,
      questionNumber: data.questionNumber,
      question: data.question,
      userAnswer: data.userAnswer,
      correctAnswer: data.correctAnswer,
      score: data.score,
      createDate: currentDate,
      updateDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create attemptDetail success`,
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
const getAttemptDetail = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attemptDetails");

    const attemptDetail = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get attemptDetail success`,
      data: attempt,
    };
  } catch (error) {
    console.error("Error getting attemptDetail:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getAttemptDetailById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("attemptDetails");
    const objectId = new ObjectId(data.id);
    const attemptDetail = await collection.findOne({ _id: objectId });
    await client.close();
    if (attempt) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attemptDetail by id success`,
        data: getAttemptDetail,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attemptDetail with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attemptDetail by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createAttemptDetail,
  getAttemptDetail,
  getAttemptDetailById,
};
