
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
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
    const classroomAttempt = database.collection("classroom_attempt");
    const classroom = database.collection("classroom");

    // Find user by email
    const user = await collection.findOne({ email: data.email });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // Initialize payload with common fields
    let payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
    };

    // Add classroom data if the user is a student and has a classroom attempt
    
    if (user.role === "student" && user.isJoined === true) {
      const classroomAttemptData = await classroomAttempt.findOne({ studentId: user._id.toString(), isDeleted: { $ne: true }});
      if (classroomAttemptData) {
        const classroomData = await classroom.findOne({ roomCode: user.roomCode });
        // Add classroomId only if classroomData is found
        if (classroomData) {
          payload.classroomId = classroomData._id;
          payload.roomCode = user.roomCode;
        }
      }
    }

    // Generate token
    const token = generateToken(payload);

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: "Login success",
      token: token,
      redirect: user.role === 'student' ? `/classroom/std/${user._id}` : `/classroom/teacher/${user._id}`,
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: error.message,
    };
  }
};



const passwordChecked = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");
    const objectId = new ObjectId(data.id);

    const user = await collection.findOne({ _id: objectId }); // Find user by ID

    if (!user) {
      // User not found
      return {
        status_code: 404, // Changed to integer
        status_phrase: "not found",
        message: "User not found"
      };
    }

    const passwordMatch = await bcrypt.compare(data.oldPassword, user.password);

    if (!passwordMatch) {
      // Password does not match
      return {
        status_code: 401, // Changed to integer
        status_phrase: "unauthorized",
        message: "Invalid password"
      };
    }

    // Password matches
    return {
      status_code: 200, // Changed to integer
      status_phrase: "ok",
      message: "Password correct"
    };

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      status_code: 500, // Changed to integer
      status_phrase: "fail",
      message: "Internal Server Error"
    };
  } finally {
    // Ensure client is closed
    await client.close();
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
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      firstname: admin.firstname
    };

    const token = generateToken(payload);

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: "Admin login successful",
      token: token,
      redirect: "/admin/dashboard"
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


const resetPassword = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");
    const email = data.email;
    const newPassword = data.hashedPassword;
    const currentDate = new Date();

    const updateData = {
      $set: {
        updateDate: currentDate,
        password: newPassword
      }
    };

    const result = await collection.updateOne(
      { email, isDeleted: { $ne: true } },
      updateData
    );

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `Update success for user with email ${email}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `User with email ${email} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: error,
    };
  } finally {
    await client.close(); // Ensure client is always closed
  }
};

const changePassword = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("users");
    const objectId = new ObjectId(data.id);
    const newPassword = data.hashedPassword;
    const currentDate = new Date();

    const updateData = {
      $set: {
        updateDate: currentDate,
        password: newPassword
      }
    };

    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      updateData
    );

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `Update success for user`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `User not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: error,
    };
  } finally {
    await client.close(); // Ensure client is always closed
  }
};

module.exports = { register, userChecked, adminChecked, resetPassword, passwordChecked, changePassword };