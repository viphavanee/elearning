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
      createDate: currentDate
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

    const theme = await collection.find().toArray();

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
        data: getTheme
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

module.exports = {
  createTheme,
  getTheme,
  getThemeById
};
