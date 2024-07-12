const { MongoClient, ObjectId } = require("mongodb");

const createAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("attempts");

    const currentDate = new Date();
    const result = await collection.insertOne({
      studentId: data.studentId,
      quizId: data.quizId,
      attemptType: data.attemptType,
      totalScore: data.totalScore,
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
        data: getAttempt,
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
  updateAttempt
};
