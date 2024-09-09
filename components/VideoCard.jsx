import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";
import { ResizeMode, Video } from "expo-av";
import { addBookmark, deleteVideo } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import Loading from "./Loading";

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    $id,
    thumbnailStorageId,
    videoStorageId,
    users: { username, avatar },
  },
  edit,
  refetch,
}) => {
  const [play, setPlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleDelete = () => {
    console.log("running");

    Alert.alert("Delete", "Are you sure, you want to Delete?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          await deleteVideo($id, thumbnailStorageId, videoStorageId);
          refetch();
        },
      },
    ]);
  };
  const { bookmark, setBookmark, user } = useGlobalContext();

  const handleBookmark = async () => {
    setLoading(true);
    try {
      let newBookmarkList;
      if (bookmark?.includes($id)) {
        //removing bookmark
        newBookmarkList = bookmark.filter((ele) => ele !== $id);
      } else {
        //adding bookmark
        newBookmarkList = [...bookmark, $id];
      }
      await addBookmark(user.$id, newBookmarkList);
      setBookmark(newBookmarkList);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBookmark} disabled={loading}>
            {loading ? (
              <Loading />
            ) : (
              <Image
                source={icons.bookmark}
                className="w-5 h-5 mr-2"
                tintColor={bookmark?.includes($id) ? "green" : null}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          {edit && (
            <Pressable onPress={handleDelete}>
              <Image
                source={icons.menu}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-72 rounded-[35px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3 "
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute rounded-full bg-gray-400/70 "
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
