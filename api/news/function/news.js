const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

const createNews = async (data, imageFile) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("news");
    
    const currentDate = new Date();
    const image = imageFile ? imageFile.buffer.toString("base64") : null;
    const newsId = uuidv4();
    await collection.insertOne({
        newsId: newsId,
      title: data.title,
      content: data.content,
      image: image,
      isDeleted: false,
      date:data.date,
      createDate: currentDate
    });

    await client.close();
    return {
      status_code: "200",
      status_phrase: "ok",
      message: `create news success`,
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
const getNews = async () => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();

    const database = client.db("project1");
    const collection = database.collection("news");

    const news = await collection.find({ isDeleted: { $ne: true } }).toArray();

    await client.close();

    return {
      status_code: "200",
      status_phrase: "ok",
      message: `get lesson success`,
      data: news,
    };
  } catch (error) {
    console.error("Error getting lesson:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const getNewsById = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("news");
    const objectId = new ObjectId(data.id);
    const news = await collection.findOne({ _id: objectId, isDeleted: { $ne: true } });
    await client.close();

    if (news) {
      return {
        status_code: "200",
        status_phrase: "ok",
        message: `get news by id success`,
        data: news,
      };
    } else {
      console.log(`news with id ${data.id} not found`);
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `news with id ${data.id} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting news by id:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const softDelete = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("news");
    
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
        message: `soft delete success for news with id ${data}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `news with id ${data} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error soft deleting lesson:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

const updateNewsImage = async (data) => {
  try {
    const client = new MongoClient(process.env.uri);
    await client.connect();
    const database = client.db("project1");
    const collection = database.collection("news");

    const objectId = new ObjectId(data.id);
    const currentDate = new Date();

    let newImageData = {};
    let newNewsData = {};

    if (data.newImage) {
      newImageData.image = data.newImage;
    }
    if (data.newtitleName) {
      newNewsData.title = data.newtitleName;
    }
    if (data.newContent) {
      newNewsData.content = data.newContent;
    }
    if (data.newdate) {
      newNewsData.date = data.newdate;
    }

    const updateData = {
      $set: {
        updateDate: currentDate,
        ...newImageData,
        ...newNewsData
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
        message: `update image success for news with id ${data.id}`,
      };
    } else {
      return {
        status_code: "404",
        status_phrase: "not found",
        message: `news with id ${data.id} not found or is already deleted`,
      };
    }
  } catch (error) {
    console.error("Error updating news image:", error);
    return {
      status_code: "301",
      status_phrase: "fail",
      message: `error`,
    };
  }
};

module.exports = {
  createNews,
  getNews,
  getNewsById,
  updateNewsImage,
  softDelete
};