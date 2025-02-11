const { MongoClient, ObjectId } = require("mongodb");

const createAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");
    const userCollect = database.collection("users");
    const studentId = new ObjectId(data.studentId);
    const currentDate = new Date();
    const getUserData = await userCollect.findOne({ _id: studentId });
    const roomCode = getUserData.roomCode;

    const result = await collection.insertOne({
      studentId: data.studentId,
      quizId: data.quizId,
      attemptType: data.attemptType,
      totalScore: data.totalScore,
      roomCode,
      durationInSec: data.durationInSec,
      createAt: currentDate
    });

    const insertedId = result.insertedId;
    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: "create attempt success",
      data: { _id: insertedId, ...data },
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: "error",
    };
  }
};
const getAttempt = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");

    const attempt = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get attempt success`,
      data: attempt,
    };
  } catch (error) {
    console.error("Error getting attempt:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAttemptByStudentId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");

    const studentId = data.studentId;
    const attemptType = data.attemptType;
    const attempt = await collection.find({studentId, attemptType}).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get attempt success`,
      data: attempt,
    };
  } catch (error) {
    console.error("Error getting attempt:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAttemptSummary = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");
    const studentId = data.studentId;
    const quizId = data.quizId;
    const roomCode = data.roomCode;
    const attempt = await collection.find({studentId, quizId, roomCode}).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get attempt success`,
      data: attempt,
    };
  } catch (error) {
    console.error("Error getting attempt:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAttemptByRoomCode = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");
    const roomCode = data.roomCode;
    const quizId = data.id;
    const attemptType = data.attemptType;
    const attempt = await collection.find({ roomCode, attemptType, quizId }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get attempt success`,
      data: attempt,
    };
  } catch (error) {
    console.error("Error getting attempt:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAttemptById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("attempts");
    const objectId = new ObjectId(data.id);
    const attempt = await collection.findOne({ _id: objectId });
    await client.close();
    if (attempt) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attempt by id success`,
        data: attempt,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attempt with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attempt by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const preTestChecked = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("attempts");
    const studentId = data.studentId;
    const roomCode = data.roomCode
    const quizId = data.quizId
    const attemptType = "pre";
    const attempt = await collection.findOne({ studentId, attemptType, roomCode, quizId });
    await client.close();
    if (attempt) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attempt by id success`,
        data: attempt,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attempt with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attempt by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const postTestChecked = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("attempts");
    const studentId = data.studentId;
    const roomCode = data.roomCode;
    const quizId = data.quizId;
    
    const attemptType = "post";
    const attempt = await collection.findOne({ studentId, attemptType, roomCode, quizId });
    await client.close();
    if (attempt) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attempt by id success`,
        data: attempt,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attempt with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attempt by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAttemptByQuizId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("attempts");
    const quizId = data.id;
    const attemptType = data.attemptType;
    const attempts = await collection.find({ quizId: quizId, attemptType: attemptType }).toArray();
    await client.close();
    if (attempts.length > 0) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attempt by id success`,
        data: attempts,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attempt with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attempt by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const checkAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");
    const { studentId, quizId, roomCode, attemptType } = data; // Destructuring for clarity

    const result = await collection.findOne({ studentId, quizId, roomCode, attemptType });
    await client.connect();
    if (result) { // Check if result is not null
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `Get attempt by id success`,
        data: result,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `Attempt with studentId ${studentId}, quizId ${quizId}, roomCode ${roomCode}, and attemptType ${attemptType} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting attempt by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `Error retrieving attempt`,
    };
  } 
};


const updateAttempt = async (attemptId, data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");
    const objectId = new ObjectId(attemptId);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: data }
    );

    await client.close();

    if (result.modifiedCount > 0) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: "update attempt success",
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `attempt with id ${attemptId} not found`,
      };
    }
  } catch (error) {
    console.error("Error updating attempt:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: "error",
    };
  }
};

module.exports = {
  createAttempt,
  getAttempt,
  getAttemptById,
  getAttemptSummary,
  updateAttempt,
  getAttemptByQuizId,
  checkAttempt,
  getAttemptByRoomCode,
  preTestChecked,
  getAttemptByStudentId,
  postTestChecked
};
