import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants/icons'

const FormField = ({title, placeholder, value, setValue, secureTextEntry}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(secureTextEntry)
  
  return (  
    <View className='w-full'>
      <Text className='font-poppins text-lg text-black/50'>{title}</Text>
      <View className={`border flex flex-row items-center justify-between rounded-xl p-1 ${isFocused ? 'border-black' : 'border-black/20'}`}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          secureTextEntry={isSecureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-base font-poppins"
          placeholderTextColor="#777" 
          autoCapitalize={title === "Email" ? "none" : "sentences"}
        />
        {
          secureTextEntry && (
            <TouchableOpacity onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}>
              <Image source={isSecureTextEntry ? icons.eye : icons.eyehide} className='w-10 h-10' />
            </TouchableOpacity>
          )
        }
      </View>
    </View>
  )
}

export default FormField