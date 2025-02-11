const { MongoClient, ObjectId } = require("mongodb");

const createTheme = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("theme");

    const currentDate = new Date();
    await collection.insertOne({
      title: data.title,
      content: data.content,
      userId: data.userId,
      lessonNum: data.lessonNum,
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
const getTheme = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("theme");

    const theme = await collection.find({ isDeleted: { $ne: true } })
      .sort({ createDate: -1 }) // Sort by createAt in descending order
      .toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get theme success`,
      data: theme
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
const getReportedTheme = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("theme");

    const theme = await collection.find({ isReport: {$in: ["reported", "checked"]} }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get theme success`,
      data: theme
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

const getThemesByIds = async (themeIds) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("theme");

    // Convert each themeId to an ObjectId
    const objectIds = themeIds.map(id => new ObjectId(id));
    const themes = await collection.find({ _id: { $in: objectIds } }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `Themes retrieved successfully`,
      data: themes
    };
  } catch (error) {
    console.error("Error getting themes:", error);
    return {
      status_code: "500",
      status_phrase: "fail",
      message: `error`,
    };
  }
};


const getThemeById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("theme");
    const objectId = new ObjectId(data.id);
    const theme = await collection.findOne({ _id: objectId });
    await client.close();
    if (theme) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get theme by id success`,
        data: theme
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


const updateThemeById = async ({ id, themeData }) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("theme");

    const objectId = new ObjectId(id);
    const currentDate = new Date();

    let newThemeData = {};

    if (themeData.newTitle) {
      newThemeData.title = themeData.newTitle;
    }
    if (themeData.newContent) {
      newThemeData.content = themeData.newContent;
    }
    if (themeData.lessonNum) {
      newThemeData.lessonNum = themeData.lessonNum;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newThemeData
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

const reportThemeById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("theme");

    const objectId = new ObjectId(data.id);

    // Update the theme
    const updateResult = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isReport: "reported", reportedAt: new Date() } }
    );

    if (updateResult.matchedCount === 1) {
      // Fetch the updated data
      const updatedTheme = await collection.findOne({ _id: objectId });

      await client.close();

      return {
        status_code: 200,
        status_phrase: "ok",
        data: updatedTheme, // Return the updated document
        message: `Update success for theme with id ${data.id}`,
      };
    } else {
      await client.close();

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
  }
};

const checkedThemeById = async (data) => {
  const client = new MongoClient(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("theme");

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
    const collection = database.collection("theme");

    const objectId = new ObjectId(data.id);
    
    // Soft delete: mark the item as deleted
    const result = await collection.updateOne(
      { _id: objectId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );
    const deletedData = await collection.findOne({ _id: objectId });

    if (result.matchedCount === 1) {

      await client.close();

      return {
        status_code: "200",
        status_phrase: "ok",
        message: `soft delete success for theme with id ${data.id}`,
        data: deletedData, // Return the deleted data
      };

    } else {
      await client.close();
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `theme with id ${data.id} not found or is already deleted`,
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
  createTheme,
  getTheme,
  getReportedTheme,
  getThemeById,
  getThemesByIds,
  checkedThemeById,
  updateThemeById,
  reportThemeById,
  softDelete
};
