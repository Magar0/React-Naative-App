import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import clsx from "clsx";
import Loading from "./Loading";

const CustomBtn = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={clsx(
        "bg-secondary rounded-xl min-h-[62px] justify-center items-center",
        containerStyles && containerStyles,
        {
          "opacity-50": isLoading,
        }
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <Text className={`text-white font-psemibold text-lg ${textStyles} `}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomBtn;
