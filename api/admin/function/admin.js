const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const createAdmin = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("admin");

    const validRoles = ["std", "admin"];
    if (!validRoles.includes(data.role)) {
      throw new Error("Invalid role");
    }

    const currentDate = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await collection.insertOne({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      createDate: currentDate,
      updateDate: currentDate,
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create admin success`,
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
const getAdmin = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("admin");

    const admin = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get admin success`,
      data: admin,
    };
  } catch (error) {
    console.error("Error getting admin:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getAdminById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("admin");
    const objectId = new ObjectId(data.id);
    const admin = await collection.findOne({ _id: objectId });
    await client.close();
    if (admin) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get admin by id success`,
        data: admin,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `admin with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting admin by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createAdmin,
  getAdmin,
  getAdminById
};
