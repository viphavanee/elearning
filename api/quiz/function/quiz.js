const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');


const createQuiz = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");

    // Check if a quiz for the specified lessonId already exists
    const existingQuiz = await collection.findOne({ lessonId: data.lessonId, isDeleted: false });
    if (existingQuiz) {
      await client.close();
      return {
        status_code: "400",
        status_phrase: "fail",
        message: `Quiz for this lesson already exists`,
      };
    }

    const currentDate = new Date();
    await collection.insertOne({
      lessonId: data.lessonId,
      quizName: data.quizName,
      numberOfQuestions: data.numberOfQuestions,
      timeInMinutes: data.timeInMinutes,
      score: data.score,
      createDate: currentDate,
      updateDate: currentDate,
      isDeleted: false
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create quiz success`,
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

const getQuiz = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");
    const quiz = await collection.find({ isDeleted: { $ne: true } }).toArray();
    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get quiz success`,
      data: quiz,
    };
  } catch (error) {
    console.error("Error getting quiz:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const getQuizById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");
    const objectId = new ObjectId(data.id);
    const quiz = await collection.findOne({ _id: objectId, isDeleted: { $ne: true } });
    await client.close();

    if (quiz) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get quiz by id success`,
        data: quiz,
      };
    } else {
      console.log(`quiz with id ${data.id} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `quiz with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting quiz by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getMultiQuizById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");
    const objectId = new ObjectId(data.id);
    const quiz = await collection.find({ _id: objectId, isDeleted: { $ne: true } }).toArray();
    await client.close();

    if (quiz) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get quiz by id success`,
        data: quiz,
      };
    } else {
      console.log(`quiz with id ${data.id} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `quiz with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting quiz by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const getQuizByLessonNum = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");
    const lessonNum = data.lessonNum;
    const quiz = await collection.findOne({ lessonId: lessonNum, isDeleted: { $ne: true } });
    await client.close();

    if (quiz) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get quiz by id success`,
        data: quiz,
      };
    } else {
      console.log(`quiz with id ${data.id} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `quiz with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting quiz by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const updateQuiz = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("quiz");

    const objectId = new ObjectId(data.id);
    const currentDate = new Date();

    let newQuizData = {};

    if (data.newquizName) {
      newQuizData.quizName = data.newquizName;
    }
    if (data.newtimeInMinutes) {
      newQuizData.timeInMinutes = data.newtimeInMinutes;
    }
    if (data.newscore) {
      newQuizData.score = data.newscore;
    }
    if (data.newlessonId) {
      newQuizData.lessonId = data.newlessonId;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newQuizData
      }
    };

    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      updateData
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `update quiz success for quiz with id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `quiz with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating quiz:", error);
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
    const quizCollection = database.collection("quiz");
    const questionCollection = database.collection("questions");
    const objectId = new ObjectId(data.id);
    const quizId = data.id;

    const questionDelete = await questionCollection.updateMany(
      { quizId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );
    const result = await quizCollection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `Soft delete success for quiz with id ${quizId}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `Quiz with id ${quizId} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting quiz:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `Internal server error`,
    };
  }
};



module.exports = {
  createQuiz,
  getQuiz,
  getQuizById,
  getMultiQuizById,
  updateQuiz,
  softDelete,
  getQuizByLessonNum
};