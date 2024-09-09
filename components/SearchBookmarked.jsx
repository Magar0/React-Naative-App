import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { icons } from "../constants";
import { router, usePathname } from "expo-router";

const SearchBookmarked = ({ handleSearch, query, handleQuery }) => {
  const [input, setInput] = useState(query || "");

  return (
    <View className="border-2 border-black-200 w-full h-14 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex flex-row space-x-4">
      <TextInput
        className="flex-1 text-white font-semibold text-base"
        value={input}
        placeholder={"Search for bookmarked video"}
        placeholderTextColor="#cdcde0"
        onChangeText={(e) => {
          setInput(e);
        }}
      />

      <TouchableOpacity
        onPress={() => {
          handleQuery(input.trim());
          handleSearch(input.trim());
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBookmarked;
