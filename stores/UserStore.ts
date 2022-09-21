import { acceptHMRUpdate } from 'pinia'

interface UserInfo {
  id: number
  nick: String
  lang: String
}

export const useUserDataStore = defineStore('UserData', () => {
  const dataStore = ref<{ [key: number]: UserInfo }>({})
  // function save(userInfo: UserInfo) {}
  // function update() {
  //   this.dataStore.
  // }
  // function delete() {
  //     this.dataStore.
  // }
  return { dataStore }
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
  function loadUserInfo() {}
  return { userDisplayLang, loginUserData, loginUserLang, loadUserInfo }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
