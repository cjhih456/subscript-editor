export default defineNuxtRouteMiddleware(() => {
  console.log('....????')
  return new Promise((resolve) => {
    console.log('???')
    resolve()
  })
})
