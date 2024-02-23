const { MongoClient, ObjectId } = require("mongodb");
const createUser = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("users");

    await collection.insertOne({
      firstname: data.firstname,
      lastname: data.lastname,
      role: data.role,
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create user success`,
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
const getUsers = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("users");

    const users = await collection.find().toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get users success`,
      data: users,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getUserById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");
    const objectId = new ObjectId(data.id);
    const user = await collection.findOne({ _id: objectId });
    await client.close();
    if (user) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get user by id success`,
        data: user,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `user with id ${data.id} not found`,
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
  createUser,
  getUsers,
  getUserById,
};
