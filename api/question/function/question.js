const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

const createQuestion = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("questions");
    const currentDate = new Date();
    const questionId = uuidv4();
    await collection.insertOne({
      questionId: questionId,
      quizId: data.quizId,
      questionNumber: data.questionNumber,
      status: data.status,
      question: data.question,
      choiceA: data.choiceA,
      choiceB: data.choiceB,
      choiceC: data.choiceC,
      choiceD: data.choiceD,
      correctAnswer: data.correctAnswer,
      createDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create question success`,
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
const getQuestion = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("questions");
    const question = await collection.find({ isDeleted: { $ne: true } }).toArray();
    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get question success`,
      data: question,
    };
  } catch (error) {
    console.error("Error getting question:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getQuestionById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("questions");
    const objectId = new ObjectId(data.id);
    const question = await collection.findOne({ _id: objectId, isDeleted: { $ne: true } });
    await client.close();
    if (question) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get question by id success`,
        data: getQuestion,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `question with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting question by id:", error);
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
    const collection = database.collection("questions");
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
        message: `soft delete success for questions with id ${data}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `questions with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting questions:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


module.exports = {
  createQuestion,
  getQuestion,
  getQuestionById,
  softDelete
};
