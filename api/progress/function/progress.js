const { MongoClient, ObjectId } = require("mongodb");

const create = async (data) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");

        const currentDate = new Date();

        await collection.insertOne({
            studentId: data.studentId,
            roomCode: data.roomCode,
            amount: 35, // Ex. 30, 35
            lessonId: data.lessonId,
            isPre: true,
            isPost: false,
            isLearn: false,
            createdAt: currentDate,
            updatedAt: currentDate
        });

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `Create progress success`,
        };
    } catch (error) {
        console.error("Error creating progress:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `Error creating progress`,
        };
    }
};

const getAll = async (data) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");
       const lessonId = new ObjectId(data.lessonId);
       const progress = await collection.find({ lessonId, roomCode: data.roomCode }).toArray();

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `Get all progress success`,
            progress: progress
        };
    } catch (error) {
        console.error("Error getting all progress:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `Error getting all progress`,
        };
    }
};

const getByStd = async (data) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");
       const progress = await collection.find({ studentId: data.studentId, roomCode: data.roomCode }).toArray();

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `Get all progress success`,
            data: progress
        };
    } catch (error) {
        console.error("Error getting all progress:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `Error getting all progress`,
        };
    }
};

const updatePost = async (data) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");

        const currentDate = new Date();

        await collection.updateOne(
            { studentId: data.studentId, roomCode: data.roomCode, lessonId: data.lessonId },
            {
                $set: {
                    amount: 100,
                    isPost: true,
                    updatedAt: currentDate
                }
            }
        );

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `Update progress success`,
        };
    } catch (error) {
        console.error("Error updating progress:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `Error updating progress`,
        };
    }
};

const updateLearning = async (data) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");

        const currentDate = new Date();

        await collection.updateOne(
            { studentId: data.studentId, roomCode: data.roomCode, lessonId: data.lessonId },
            {
                $set: {
                    amount: 65,
                    isLearn: true,
                    updatedAt: currentDate
                }
            }
        );

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `Update progress success`,
        };
    } catch (error) {
        console.error("Error updating progress:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `Error updating progress`,
        };
    }
};


const getProgressByStudentId = async (data) => {
    try {
        console.log("Fetching progress with data:", data); // Debugging log

        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("progress");

        // แปลง studentId และ id (ห้องเรียน) เป็น ObjectId ก่อนค้นหา
        const studentObjectId = new ObjectId(data.studentId);
        const classroomObjectId = new ObjectId(data.classroomId);

        const progress = await collection.find({
            studentId: studentObjectId, 
            roomCode: classroomObjectId, 
            isPost: true
        }).toArray();

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: "Get progress by student ID success",
            progress: progress
        };
    } catch (error) {
        console.error("Error getting progress by student ID:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: "Error getting progress by student ID",
        };
    }
};


module.exports = {
    create,
    getAll,
    getByStd,
    updatePost,
    updateLearning,
    getProgressByStudentId
    
};