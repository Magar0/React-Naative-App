import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.thapa.react-native",
  projectId: "66d86339002482d66453",
  databaseId: "66d865f70004e252c76b",
  userCollectionId: "66d86706002aa86cae62",
  videoCollectionId: "66d8673b0032bd39a025",
  storageId: "66d86c750006e1d9ab4b",
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const database = new Databases(client);
const storage = new Storage(client);

// Sign up......
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error();
    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password);

    const newUser = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (err) {
    throw Error(err.message);
  }
};

//sign in.........
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (err) {
    throw Error(err.message);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await database.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async () => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.search("title", query)]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.equal("users", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

//functions to upload video......
export const getFilePreview = async (fileId, type) => {
  console.log("getFile preview runnning of", type, fileId);

  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(config.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        config.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error({ message: "Invalid file type" });
    }
    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };
  try {
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return { $id: uploadedFile.$id, fileUrl };
  } catch (error) {
    console.log(error);

    throw new Error(error.message);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnail, video] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    console.log({ thumbnail, video });

    const newPost = await database.createDocument(
      config.databaseId,
      config.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnail.fileUrl,
        video: video.fileUrl,
        details: form.details,
        users: form.userId,
        thumbnailStorageId: thumbnail.$id,
        videoStorageId: video.$id,
      }
    );
    console.log({ newPost });

    return newPost;
  } catch (error) {
    throw new Error(error.message);
  }
};

//delete

export const deleteFile = async (fileId) => {
  try {
    console.log("delete running");

    const res = await storage.deleteFile(config.storageId, fileId);

    return;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const deleteVideo = async (
  videoId,
  thumbnailStorageId,
  videoStorageId
) => {
  try {
    await Promise.all([
      deleteFile(thumbnailStorageId),
      deleteFile(videoStorageId),
    ]);

    const deleted = await database.deleteDocument(
      config.databaseId,
      config.videoCollectionId,
      videoId
    );
    return deleted;
  } catch (error) {
    throw new Error();
  }
};

//bookmark...
export const addBookmark = async (userId, likedVideos) => {
  try {
    console.log("🟡adding bookmark");

    const result = await database.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      { likedVideos }
    );

    console.log("🟢 adding success");

    return result;
  } catch (error) {
    console.log(error);
  }
  // const result = await database.updateDocument(config.databaseId,config.userCollectionId, userId ,{likedVideos: {$pull: videoId}})
};
