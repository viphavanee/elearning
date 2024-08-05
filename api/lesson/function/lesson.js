const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

const createLesson = async (data, imageFile) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("lessons");

    // Check if lessonNum is unique
    const existingLesson = await collection.findOne({ lessonNum: data.lessonNum });
    if (existingLesson) {
      await client.close();
      return {
        status_code: "409", // Conflict status code
        status_phrase: "fail",
        message: `บทที่ ${data.lessonNum} มีในระบบแล้ว`,
      };
    }

    const currentDate = new Date();
    const image = imageFile ? imageFile.buffer.toString("base64") : null;
    const lessonId = uuidv4();
    await collection.insertOne({
      lessonId: lessonId,
      lessonNum: data.lessonNum,
      lessonName: data.lessonName,
      content: data.content,
      image: image,
      vdo_url: data.vdo_url,
      isDeleted: false,
      createDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create lesson success`,
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `Internal server error`,
    };
  }
};

const getLesson = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("lessons");

    const lessons = await collection.find({ isDeleted: { $ne: true } }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get lesson success`,
      data: lessons,
    };
  } catch (error) {
    console.error("Error getting lesson:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getLessonById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("lessons");
    const objectId = new ObjectId(data.id);
    const lesson = await collection.findOne({ _id: objectId, isDeleted: { $ne: true } });
    await client.close();

    if (lesson) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get lesson by id success`,
        data: lesson,
      };
    } else {
      console.log(`Lesson with id ${data.id} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `lesson with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting lesson by id:", error);
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
    const collection = database.collection("lessons");
    const quizCollect = database.collection("quiz");
    const questionCollect = database.collection("questions");

    const objectId = new ObjectId(data.id);
    const lessonNum = data.lessonNum;

    // Find the quiz associated with the lesson
    const quiz = await quizCollect.findOne({ lessonId: lessonNum, isDeleted: { $ne: true } });

    const quizId = quiz._id.toString();

    // Update the questions associated with the quiz
    const questionResult = await questionCollect.updateMany(
      { quizId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    // Update the quiz

    const quizResult = await quizCollect.updateOne(
      { lessonId: lessonNum, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    // Update the lesson
    const lessonResult = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    await client.close();

    // Check if the lesson was successfully updated
    if (lessonResult.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for lesson with id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `lesson with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting lesson:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `Internal server error`,
    };
  }
};


const updateLessonImage = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("lessons");

    const objectId = new ObjectId(data.id);
    const currentDate = new Date();

    let newImageData = {};
    let newLessonData = {};

    if (data.newImage) {
      newImageData.image = data.newImage;
    }
    if (data.newLessonNum) {
      newLessonData.lessonNum = data.newLessonNum;
    }
    if (data.newLessonName) {
      newLessonData.lessonName = data.newLessonName;
    }
    if (data.newContent) {
      newLessonData.content = data.newContent;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newImageData,
        ...newLessonData
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
        message: `update image success for lesson with id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `lesson with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating lesson image:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};




module.exports = {
  createLesson,
  getLesson,
  getLessonById,
  updateLessonImage,
  softDelete
};