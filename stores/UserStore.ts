import { acceptHMRUpdate, defineStore } from 'pinia'

export const useChannelDataStore = defineStore('ChannelData', () => {
  const dataStore = ref<{ [key: number]: ChannelInfo }>({})
  const userDataStore = useUserDataStore()
  function setChannelData (channelData: ChannelInfo) {
    if (channelData.userData) {
      channelData.uId = channelData.userData.idx
      userDataStore.setUserData(channelData.userData)
      delete channelData.userData
    }
    if (dataStore.value[channelData.id]) {
      Object.assign(dataStore.value[channelData.id], channelData)
    } else {
      dataStore.value[channelData.id] = channelData
    }
  }
  const takeChannelData = computed(() => {
    return (idx: number) => dataStore.value[idx]
  })
  return { dataStore, takeChannelData, setChannelData }
})

export const useUserDataStore = defineStore('UserData', () => {
  const dataStore = ref<{ [key: number]: UserInfo }>({})
  const channelDataStore = useChannelDataStore()

  function setUserData (userData: UserInfo) {
    if (userData.channelData) {
      userData.channelId = userData.channelData.id
      channelDataStore.setChannelData(userData.channelData)
      delete userData.channelData
    }
    if (dataStore.value[userData.idx]) {
      Object.assign(dataStore.value[userData.idx], userData)
    } else {
      dataStore.value[userData.idx] = userData
    }
  }
  const takeUserData = computed(() => {
    return (idx: number) => dataStore.value[idx]
  })
  return { dataStore, takeUserData, setUserData }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserDataStore, import.meta.hot))
}

export const useUserStore = defineStore('User', () => {
  const userDataStore = useUserDataStore()
  const userId = ref(0)
  const userDisplayLang = ref('')
  const loginUserData = computed(() => {
    return userDataStore.dataStore[userId.value]
  })
  const loginUserLang = computed(() => {
    return loginUserData.value.lang || ''
  })
  function loadUserInfo () {
    return useCustomFetch('/api/userData', {
      method: 'post'
    })
  }
  function tokenValid () {
    return useCustomFetch('/api/tokenValid', {
      method: 'post'
    })
  }
  return { userDisplayLang, loginUserData, loginUserLang, loadUserInfo, tokenValid }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
