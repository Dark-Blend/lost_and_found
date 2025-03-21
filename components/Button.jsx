import { Text, TouchableOpacity , Image } from 'react-native'
import React from 'react'
import { icons } from '../constants/icons'

const Button = ({title , onPress , className }) => {

  return (
    <TouchableOpacity className={`bg-secondary rounded-xl w-full h-16 relative flex items-center justify-center ${className}`} onPress={onPress}>
        <Text className='text-white font-poppins-bold text-xl'>{title}</Text>
        <Image source={icons.rightarrow} className='w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2' tintColor={'white'} resizeMode='contain'/>
    </TouchableOpacity>
  )
}

export default Button