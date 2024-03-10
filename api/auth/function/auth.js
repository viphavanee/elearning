const encode = require("../../../function/encode");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

const register = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("users");
    const userId = uuidv4();
    const currentDate = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await collection.insertOne({
      userId: userId,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      school: data.school,
      password: hashedPassword,
      role: data.role,
      birthDate: data.birthDate,
      createDate: currentDate,
      updateDate: currentDate
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

const userChecked = async (data) => {
  try {
      const client = new MongoClient(process.env.uri);
      await client.connect();
      const database = client.db("project1");
      const collection = database.collection("users");
      const user = await collection.findOne({ email: data.email }); // ค้นหาผู้ใช้โดยใช้อีเมล
      if (!user) {
          throw new Error('User not found');
      }
      const passwordMatch = await bcrypt.compare(data.password, user.password);
      if (!passwordMatch) {
          throw new Error('Invalid password');
      }
      if (user.role === 'student') {
          return {
              status_code: "200",
              status_phrase: "ok",
              message: `Login success`,
              redirect: '/userHome'
          };
      } else if (user.role === 'teacher') {
          return {
              status_code: "200",
              status_phrase: "ok",
              message: `Login success`,
              redirect: '/teacherHome' 
          };
      } else {
          throw new Error('Invalid role');
      }
  } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      return {
          status_code: "301",
          status_phrase: "fail",
          message: error.message
      };
  }
};



const adminChecked = async (data) => {
  try {
      const client = new MongoClient(process.env.uri);
      await client.connect();

      const database = client.db("project1");
      const collection = database.collection("admin");
      
      const admin = await collection.findOne({ username: data.username });
      if (!admin) {
          throw new Error("Admin not found");
      }
      const validPassword = await bcrypt.compare(data.password, admin.password);
      if (!validPassword) {
          throw new Error("Incorrect password");
      }
      if (admin.role !== 'admin') {
          throw new Error("User is not admin");
      }

      return {
          status_code: "200",
          redirect: "/lesson",
          message: "Admin login successful"
      };
  } catch (error) {
      console.error(error);
      return {
          status_code: "500",
          message: error.message
      };
  }
};


module.exports = { register, userChecked, adminChecked };