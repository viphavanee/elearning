const { MongoClient, ObjectId } = require("mongodb");

const createClassroomAttempt = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");
    const userCollect = database.collection("users");
    const studentId = new ObjectId(data.studentId);
    const currentDate = new Date();
    await collection.insertOne({
      studentId: data.studentId,
      roomCode: data.roomCode,
      jointAt: currentDate
    });

    await userCollect.updateOne({
      _id: studentId
    },
      {
        $set: {
          isJoined: true,
          roomCode: data.roomCode
        }
      }
    );

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create classroom success`,
      redirect: studentId.toString()
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

    const classroom = await collection.find({ isDeleted: { $ne: true } }).toArray();

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
        data: getClassroomAttempt,
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
const getClassroomByRoomCode = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");
    const roomCode = data.roomCode;
    const attemptDetail = await collection.find({ roomCode: roomCode, isDeleted: { $ne: true } }).toArray();
    await client.close();
    if (attemptDetail) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get attemptDetail by id success`,
        data: attemptDetail,
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
const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom_attempt");

    const studentId = data.studentId;
    const roomCode = data.roomCode;
    const result = await collection.updateOne(
      { studentId: studentId, roomCode: roomCode, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for lesson with id ${data}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `lesson with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting lesson:", error);
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
  getClassroomByIdAttempt,
  getClassroomByRoomCode,
  softDelete
};
