const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");

// Helper function to generate a unique room code
const generateUniqueRoomCode = async (collection) => {
  let isUnique = false;
  let roomCode;

  while (!isUnique) {
    // Generate a random code
    roomCode = crypto.randomBytes(3).toString("hex"); // Generates a 6-character hex string

    // Check if the code already exists in the collection
    const existingClassroom = await collection.findOne({ roomCode });
    if (!existingClassroom) {
      isUnique = true;
    }
  }

  return roomCode;
};
const createClassroom = async (data, imageFile, userId) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("classroom");
    const roomCode = await generateUniqueRoomCode(collection);
    const image = imageFile ? imageFile.buffer.toString("base64") : null;
    const currentDate = new Date();
    await collection.insertOne({
      teacherId: userId,
      classroomName: data.classroomName,
      roomCode: roomCode,
      image: image,
      createDate: currentDate,
      isDeleted: false,
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
const getClassroom = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("classroom");

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
const getClassroomById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom");
    const objectId = new ObjectId(data.id);
    const classroom = await collection.findOne({ _id: objectId });
    await client.close();
    if (classroom) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get classroom by id success`,
        data: classroom,
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
    const collection = database.collection("classroom");
    const userCollect = database.collection("users");
    const objectId = new ObjectId(data.id);
    const getUser = await userCollect.findOne({ _id: objectId });
    const roomCode = getUser.roomCode;
    const classroom = await collection.find({ roomCode, isDeleted: { $ne: true } }).toArray();
    await client.close();
    if (classroom) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get classroom by id success`,
        data: classroom,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `classroom with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting classroom by roomcode:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getClassroombyTeacherId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom");
    const teacherId = data.id;
    const classroom = await collection.find({ teacherId: teacherId, isDeleted: { $ne: true } }).toArray();
    await client.close();
    if (classroom) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get classroom by id success`,
        data: classroom,
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

const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom");

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

const updateClassroomImage = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("classroom");

    const objectId = new ObjectId(data.id);
    const currentDate = new Date();

    let newImageData = {};
    let newClassroomData = {};

    if (data.newImage) {
      newImageData.image = data.newImage;
    }
    if (data.newClassroomName) {
      newClassroomData.ClassroomName = data.newClassroomName;
    }


    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newImageData,
        ...newClassroomData
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
        message: `update image success for classroom with id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `classroom with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating classroom image:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createClassroom,
  getClassroom,
  getClassroomById,
  getClassroombyTeacherId,
  softDelete,
  updateClassroomImage,
  getClassroomByRoomCode
};
