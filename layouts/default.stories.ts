import CustomDefaultLayout from './default.jsx'

export default {
  title: 'Layouts/default',
  component: CustomDefaultLayout,
  parameters: {
    layout: 'fullscreen'
  }
}

const Template = () => ({
  components: { CustomDefaultLayout },
  template: '<custom-default-layout />'
})

export const DefaultCustomDefaultLayout =
  Template.bind({})
