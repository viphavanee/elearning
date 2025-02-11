const { MongoClient, ObjectId } = require("mongodb");

const create = async(data) => {
    try {
        const client = new MongoClient(process.env.uri);
        await client.connect(); 
        const database = client.db("project1");
        const collection = database.collection("reply");

        const content = data.content;
        const themeId = data.themeId;
        const commentId = data.commentId;
        const userId = data.userId;
        const createAt = new Date();

        const result = await collection.insertOne({
            content,
            themeId,
            commentId,
            userId,
            createAt
        });

        const createdData = await collection.findOne({ _id: result.insertedId });

        await client.close();
        return {
            status_code: "200",
            status_phrase: "ok",
            message: `create reply success`,
            data: createdData
        };

    } catch (error) {
        console.error("Error create reply:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `error`,
        };
    }
}

const getByCommentId = async (data) => {
    try {
      const client = new MongoClient(process.env.uri);
      await client.connect();
  
      const database = client.db("project1");
      const collection = database.collection("reply");
  
      const commentId = data.commentId.toString();
      const reply = await collection.find(  { commentId, isDeleted: { $ne: true } }).toArray();
  
      await client.close();
  
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get reply success`,
        data: reply
      };
    } catch (error) {
      console.error("Error getting reply:", error);
      return {
        status_code: "500",
        status_phrase: "fail",
        message: `error`,
      };
    }
  };

const updated = async(data) => {
    try {
        const client = new MongoClient(process.env.uri);
        await client.connect(); 
        const database = client.db("project1");
        const collection = database.collection("reply");

        const newContent = data.newContent;
        const updateAt = new Date();
        const id = data.id;
        const objectId = new ObjectId(id);
       
        const updateData = {
            $set: {
                content: newContent,
                updateAt
            }
          };
      
          const result = await collection.updateOne(
            { _id: objectId, isDeleted: { $ne: true } },
            updateData
          );


        await client.close();
        if(result.matchedCount === 1){
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
        console.error("Error create reply:", error);
        return {
            status_code: "500",
            status_phrase: "fail",
            message: `error`,
        };
    }
}

const reportReplyById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("reply");

    const objectId = new ObjectId(data.id);

    // Update the comment
    const updateResult = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isReport: "reported", reportedAt: new Date() } }
    );

    if (updateResult.matchedCount === 1) {
      // Fetch the updated comment
      const updatedReply = await collection.findOne({ _id: objectId });

      await client.close();

      return {
        status_code: 200,
        status_phrase: "ok",
        data: updatedReply, // Return the updated comment data
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

const getReportedReply = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("reply");

    const reply = await collection.find({ isReport: {$in: ["reported", "checked"]} }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get reply success`,
      data: reply
    };
  } catch (error) {
    console.error("Error getting reply :", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const checkedReplyById = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("reply");

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
    const collection = database.collection("reply");

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
module.exports = {
    create,
    getByCommentId,
    updated,
    reportReplyById,
    checkedReplyById,
    getReportedReply,
    softDelete
};