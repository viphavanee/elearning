const { MongoClient, ObjectId } = require("mongodb");

const createComment = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("comment");

    const currentDate = new Date();
    await collection.insertOne({
      themeId: data.themeId,
      content: data.content,
      userId: data.userId,
      createDate: currentDate,
      updateDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create theme success`,
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

const getComment = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("comment");

    const comment = await collection.find({ isDeleted: { $ne: true } }).sort({ createDate: -1 }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get theme success`,
      data: comment
    };
  } catch (error) {
    console.error("Error getting theme:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};
const getReportedComment = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("comment");

    const comment = await collection.find({ isReport: {$in: ["reported", "checked"]} }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get theme success`,
      data: comment
    };
  } catch (error) {
    console.error("Error getting theme:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getCommentsByIds = async (commentIds) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("comment");
    const objectIds = commentIds.map(id => new ObjectId(id));

    const comments = await collection.find({ _id: { $in: objectIds } }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `Comments retrieved successfully`,
      data: comments
    };
  } catch (error) {
    console.error("Error getting comments:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const getCommentById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");
    const objectId = new ObjectId(data.id);
    const comment = await collection.findOne({ _id: objectId });
    await client.close();
    if (comment) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get theme by id success`,
        data: comment
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `theme with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting theme by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getCommentByThemeId = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");
    const themeId = data.themeId;
    const comment = await collection.find({ themeId, isDeleted: { $ne: true } }).toArray();

    await client.close();
    if (comment) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get theme by id success`,
        data: comment
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `comment with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting theme by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const updateCommentById = async ({ id, commentData }) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");

    const objectId = new ObjectId(id);
    const currentDate = new Date();

    let newCommentData = {};

    if (commentData.newContent) {
      newCommentData.content = commentData.newContent;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newCommentData
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

const reportCommentById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");

    const objectId = new ObjectId(data.id);

    // Update the comment
    const updateResult = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isReport: "reported", reportedAt: new Date() } }
    );

    if (updateResult.matchedCount === 1) {
      // Fetch the updated comment
      const updatedComment = await collection.findOne({ _id: objectId });

      await client.close();

      return {
        status_code: 200,
        status_phrase: "ok",
        data: updatedComment, // Return the updated comment data
        message: `Update success for comment with id ${data.id}`,
      };
    } else {
      await client.close();

      return {
        status_code: 404,
        status_phrase: "not found",
        message: `Comment with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      status_code: 500,
      status_phrase: "fail",
      message: "Internal Server Error",
    };
  }
};

const checkedCommentById = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");

    const objectId = new ObjectId(data.id);
    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } }, // Ensures theme is not deleted
      { $set: { isReport: "checked", reportedAt: new Date() } } // Set the report status
    );

    if (result.matchedCount === 1) {
      return {
        status_code: 200,
        status_phrase: "ok",
        message: `Update success for theme with id ${data.id}`,
      };
    } else {
      return {
        status_code: 404,
        status_phrase: "not found",
        message: `Theme with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating theme:", error);
    return {
      status_code: 500,
      status_phrase: "fail",
      message: "Internal Server Error",
    };
  } finally {
    await client.close(); // Ensure client is closed in the finally block
  }
};

const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");

    const objectId = new ObjectId(data.id);
    
    // Soft delete: mark the comment as deleted
    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );
    const deletedData = await collection.findOne({ _id: objectId });

    if (result.matchedCount === 1) {
      // Fetch the deleted comment to return it

      await client.close();

      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for comment with id ${data.id}`,
        data: deletedData, // Return the deleted comment data
      };
    } else {
      await client.close();
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `comment with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting comment:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const softDeleteMany = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("comment");

    const themeId = data.themeId;
    const result = await collection.updateMany(
      { themeId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );

    await client.close();

    if (result.matchedCount === 1) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for theme with id ${data}`

      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `theme with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting theme:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createComment,
  getComment,
  getReportedComment,
  getCommentById,
  getCommentsByIds,
  getCommentByThemeId,
  updateCommentById,
  reportCommentById,
  checkedCommentById,
  softDelete,
  softDeleteMany
};
