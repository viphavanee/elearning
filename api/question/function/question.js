const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

const createQuestion = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("questions");

    // Find the latest questionNumber for the given quizId
    const latestQuestion = await collection.findOne(
      { quizId: data.quizId },
      { sort: { questionNumber: -1 }, projection: { questionNumber: 1 } }
    );

    let nextQuestionNumber = 1; // Default to 1 if no questions exist yet for this quizId

    if (latestQuestion) {
      nextQuestionNumber = latestQuestion.questionNumber + 1;
    }

    const currentDate = new Date();
    const questionId = uuidv4();

    await collection.insertOne({
      questionId: questionId,
      quizId: data.quizId,
      questionNumber: nextQuestionNumber,
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
      message: `Create question success`,
      quizId: data.quizId,
      questionNumber: nextQuestionNumber
    };
  } catch (error) {
    console.error("Error creating question:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `Error creating question`,
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
        data: question,
      };
    } else {
      console.log(`question with id ${data.id} not found`);
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
const getQuestionByQId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("questions");
    const question = await collection.find({ quizId: data.quizId, isDeleted: { $ne: true } }).toArray();
    await client.close();

    if (question) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get question by id success`,
        data: question,
      };
    } else {
      console.log(`question with quizId ${data.quizId} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `question with quizId ${data.quizId} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting question by quizId:", error);
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

const updateQuestion = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("questions");
    const objectId = new ObjectId(data.id);

    const updatedData = {
      question: data.question,
      choiceA: data.choiceA,
      choiceB: data.choiceB,
      choiceC: data.choiceC,
      choiceD: data.choiceD,
      correctAnswer: data.correctAnswer,
      updateDate: new Date()
    };

    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: updatedData }
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        quizId: data.quizId,
        message: `update question success for id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `question with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating question:", error);
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
  getQuestionByQId,
  softDelete,
  updateQuestion
};
