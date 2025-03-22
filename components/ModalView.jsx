import { View, StyleSheet, TouchableOpacity , Image , Modal , Text } from 'react-native'
import React from 'react'
import { icons } from '../constants/icons'

const ModalView = ({isModalVisible , setIsModalVisible , children}) => {
  return (
    <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        className="relative "
      >
        <View className="bg-white w-[350px] h-[500px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-xl p-2" style={styles.shadowedView}>

        {/* closeButton */}
          <View className="w-full h-fit flex flex-row justify-between items-center">
            <Text className="font-poppins-bold text-xl">Add a new Item</Text>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
              }}
            >
              <Image
                source={icons.close}
                className="w-[40px] h-[40px]"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </Modal>
  )
}

const styles = StyleSheet.create({
    shadowedView: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 5,
    },
  });

export default ModalView