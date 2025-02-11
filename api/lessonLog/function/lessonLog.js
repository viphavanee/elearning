const { MongoClient, ObjectId } = require("mongodb");

const createLessonLog = async (data) => {
    try {
        const client = new MongoClient(process.env.uri);
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("lessonLog");

        const currentDate = new Date();

        await collection.insertOne({
            studentId: data.studentId,
            checkPoint: data.checkPoint,
            status: data.status,
            lessonNum: data.lessonNum,
            roomCode: data.roomCode,
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
const getLessonLog = async (data) => {
    try {
        const client = new MongoClient(process.env.uri);
        await client.connect();

        const database = client.db("project1");
        const collection = database.collection("lessonLog");

        const studentId = data.studentId;
        const lessonNum = data.lessonNum;
        const roomCode = data.roomCode;
        const lessonLog = await collection.findOne({ studentId, lessonNum, roomCode });


        await client.close();

        if (lessonLog) {
            return {
                status_code: "200",
                status_phrase: "ok",
                message: `get lesson log success`,
                data: lessonLog,
            };
        } else {
            return {
                status_code: "400",
                status_phrase: "not found",
                message: `not found lesson log`,
            };
        }

    } catch (error) {
        console.error("Error getting lessonLog:", error);
        return {
            status_code: "301",
            status_phrase: "fail",
            message: `error`,
        };
    }
};

const updateLessonLog = async (dataId, dataUpdate) => {
    try {
        const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const database = client.db("project1");
        const collection = database.collection("lessonLog");

        const studentId = dataId.studentId;
        const lessonNum = dataId.lessonNum;
        const roomCode = dataId.roomCode;
        const currentDate = new Date();

        let newLessonLog = {};

        if (dataUpdate.checkPoint) {
            newLessonLog.checkPoint = dataUpdate.checkPoint;
        }
        if (dataUpdate.status) {
            newLessonLog.status = dataUpdate.status;
        }


        const updateData = {
            $set: {
                updateDate: currentDate,
                ...newLessonLog
            }
        };

        const result = await collection.updateOne(
            { studentId, lessonNum, roomCode, isDeleted: { $ne: true } },
            updateData
        );

        await client.close();

        if (result.matchedCount === 1) {
            return {
                status_code: "200",
                status_phrase: "ok",
                message: `Update success for lesson log`,
            };
        } else {
            return {
                status_code: "404",
                status_phrase: "not found",
                message: `Lesson log not found or is already deleted`,
            };
        }
    } catch (error) {
        console.error("Error updating lesson log:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: "Internal Server Error",
        };
    }
};


module.exports = {
    createLessonLog,
    getLessonLog,
    updateLessonLog
};
