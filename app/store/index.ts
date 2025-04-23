export const useStore = defineStore('store', {
  state: () => ({
    name: '',
    description: '',
    maximizedMenu: false,
    maximizedInfo: false,
    showImageSettings: false,
    enableBackgroundBlurLayer: false,
    enableFrameShadow: false,
    borderV: 0,
    borderH: 0,
    colorFrame: '#000000',
    light: 0,
    lightBaseColor: '#000',
    lightBaseColorRGB: '0, 0, 0',
    lightHiCnstColorRGB: '255, 255, 255',
    lightLowCnstColorRGB: '160, 160, 160',
    galeryScrollPos: 0,
    loupeSize: 200,
    enableMagnifier: false,
    magnifierZoomFactor: 2
  }),
  actions: {
    setMaximizedMenu(value: boolean) {
      this.maximizedMenu = value
    },
    setMaximizedInfo(value: boolean) {
      this.maximizedInfo = value
    },
    toggleMaximizedMenu() {
      this.maximizedMenu = !this.maximizedMenu
    },
    toggleMaximizedInfo() {
      this.maximizedInfo = !this.maximizedInfo
    },
    toggleShowImageSettings() {
      this.showImageSettings = !this.showImageSettings
    }
  }
})
