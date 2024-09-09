import { View, Text, FlatList, StatusBar, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import { getAllPost } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";
import SearchBookmarked from "../../components/SearchBookmarked";
import Loading from "../../components/Loading";

const Bookmark = () => {
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [bookmarkList, setBookmarkList] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const { data: posts, refetch } = useAppwrite(getAllPost);
  const { bookmark } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleQuery = (e) => setSearchInput(e);
  const handleSearch = (term) => {
    const filtered = bookmarkList.filter((video) =>
      video.title.match(new RegExp(term, "i"))
    );
    setFilteredBookmarks(filtered);
  };
  //refreshing
  const onRefresh = async () => {
    setRefreshing(true);
    //re call videos -> if any new videos appeared
    await refetch();
    setSearchInput("");
    setRefreshing(false);
  };

  useEffect(() => {
    setBookmarkList(() =>
      posts.filter((video) => bookmark.includes(video.$id))
    );
    setLoading(false);
  }, [bookmark, posts]);

  console.log(searchInput);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={searchInput ? filteredBookmarks : bookmarkList}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              {/* Search Results */}
              Saved Videos
            </Text>
            {searchInput ? (
              <>
                <Text className="text-2xl font-psemibold text-white ">
                  {searchInput}
                </Text>
                <View className="mt-6 mb-8"></View>
              </>
            ) : (
              <View className="my-2"></View>
            )}

            <SearchBookmarked
              query={searchInput}
              handleQuery={handleQuery}
              handleSearch={handleSearch}
            />
          </View>
        )}
        ListEmptyComponent={() =>
          loading ? (
            <Loading />
          ) : (
            <EmptyState
              title="No Videos Found"
              subtitle="No Videos Found for this search"
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <StatusBar backgroundColor={"#161622"} barStyle={"light"} />
    </SafeAreaView>
  );
};

export default Bookmark;
