import SideMenu from "../core/side-menu/ui/SideMenu"

export default defineNuxtComponent({
  name: 'HeaderDefault',
  render () {
    return <div class="py-2 bg-sidebar-accent flex justify-between px-4">
      <h3 class="font-bold text-xl">Subtitle Editor</h3>
      <div>
        <SideMenu />
      </div>
    </div>
  }
})
