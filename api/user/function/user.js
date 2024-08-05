const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const createUser = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("users");

    const currentDate = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await collection.insertOne({
      studentId: data.studentId,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      school: data.school,
      password: hashedPassword,
      role: data.role,
      createDate: currentDate,
      updateDate: currentDate,
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

    const users = await collection.find({ isDeleted: { $ne: true } }).toArray();


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

const getStudent = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");
    const objectId = new ObjectId(data.id);
    const user = await collection.find({ _id: objectId }).toArray();
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

const updateUserById = async (id, userData) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");

    const objectId = new ObjectId(id);
    const currentDate = new Date();

    let newUserData = {};

    if (userData.newFirstName) {
      newUserData.firstname = userData.newFirstName;
    }
    if (userData.newLastName) {
      newUserData.lastname = userData.newLastName;
    }
    if (userData.newEmail) {
      newUserData.email = userData.newEmail;
    }
    if (userData.newSchool) {
      newUserData.school = userData.newSchool;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newUserData
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
        message: `Update success for user with id ${id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `User with id ${id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: "Internal Server Error",
    };
  }
};


const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");

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
        message: `soft delete success for user with id ${data}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `user with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting user:", error);
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
  updateUserById,
  getStudent,
  softDelete
};
