
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY); // Adjust expiresIn as per your requirements
}

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

const userChecked = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");

    const user = await collection.findOne({ email: data.email }); // Find user by email

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);
    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `Login success`,
      token: token,
      redirect: user.role === 'student' ? '/classroom/std' : '/classroom'
    };
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

    const payload = {
      adminId: admin._id,
      username: admin.username,
      role: admin.role
    };

    const token = generateToken(payload);

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: "Admin login successful",
      token: token,
      redirect: "/lesson"
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: error.message
    };
  }
};


module.exports = { register, userChecked, adminChecked };