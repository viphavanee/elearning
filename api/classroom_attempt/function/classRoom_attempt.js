const { MongoClient, ObjectId } = require("mongodb");

const createClassroomAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");

    const currentDate = new Date();
    await collection.insertOne({
      studentId: data.studentId,
      roomCode: data.roomCode,
      jointAt: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create classroom success`,
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
const getClassroomAttempt = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");

    const classroom = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get classroom success`,
      data: classroom
    };
  } catch (error) {
    console.error("Error getting classroom:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getClassroomByIdAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");
    const objectId = new ObjectId(data.id);
    const classroom = await collection.findOne({ _id: objectId });
    await client.close();
    if (classroom) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get classroom by id success`,
        data: getClassroom,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `classroom with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting classroom by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createClassroomAttempt,
  getClassroomAttempt,
  getClassroomAttemptById
};
