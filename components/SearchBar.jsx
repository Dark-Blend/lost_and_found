import { View, Image, TouchableOpacity } from 'react-native'
import { StyleSheet } from 'react-native'
import React from 'react'
import { icons } from '../constants/icons'
import { TextInput } from 'react-native'

const SearchBar = () => {
  return (
    <View className='absolute top-0 w-full p-2 flex flex-row gap-2 p-3' >
      <View className='h-full relative flex-1' >
         <TextInput placeholder='Something lost? Find it here' className='w-full h-full rounded-full bg-white p-2 px-10' placeholderTextColor={'#898989'}/>
         <TouchableOpacity className='absolute bg-black rounded-full p-2 right-1 top-1/2 -translate-y-1/2'>
            <Image source={icons.search}  className='w-10 h-10' resizeMode='contain' tintColor={'white'}/>
         </TouchableOpacity>
      </View>
      <TouchableOpacity className='bg-white flex justify-center items-center p-2 rounded-full' style={styles.filterButton}>
        <Image source={icons.filter}  className='w-12 h-12' resizeMode='contain'/>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  filterButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
})

export default SearchBar