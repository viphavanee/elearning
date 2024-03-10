const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const createTeacher = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("teacher");

    const currentDate = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await collection.insertOne({
      teacherId: data.teacherId,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      school: data.school,
      password: hashedPassword,
      role: data.role,
      createDate: currentDate,
      updateDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create teacher success`,
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
const getTeacher = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("teacher");

    const teacher = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get teacher success`,
      data: teacher,
    };
  } catch (error) {
    console.error("Error getting teacher:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getTeacherById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("teacher");
    const objectId = new ObjectId(data.id);
    const teacher = await collection.findOne({ _id: objectId });
    await client.close();
    if (teacher) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get teacher by id success`,
        data: teaher,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `teacher with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting user by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createTeacher,
  getTeacher,
  getTeacherById
};
